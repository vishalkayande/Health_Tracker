type UserRow = { id: number; email: string; password?: string | null; name?: string | null } | null;

let dbImpl: {
	initDatabase: () => Promise<void>;
	getUserById: (id: number) => Promise<UserRow>;
	createUser: (payload: { email: string; password: string; name?: string }) => Promise<UserRow>;
	findUserByEmailAndPassword: (email: string, password: string) => Promise<UserRow>;
};

(() => {

	try {
		
		const expoSqlite = require('expo-sqlite');
		const openDatabase = (expoSqlite && (expoSqlite.openDatabase ?? expoSqlite.default ?? expoSqlite))?.openDatabase ?? expoSqlite.openDatabase ?? expoSqlite;
	
		if (typeof openDatabase === 'function') {
			const db = openDatabase('healthtracker.db');
			const ensureUsersTable = (): Promise<void> =>
				new Promise((resolve, reject) => {
					db.transaction(
						(tx: any) => {
							tx.executeSql(
								`CREATE TABLE IF NOT EXISTS users (
									id INTEGER PRIMARY KEY AUTOINCREMENT,
									email TEXT UNIQUE,
									password TEXT,
									name TEXT
								);`,
								[],
								() => resolve(),
								(_tx: any, err: any) => {
									reject(err);
									return false;
								}
							);
						},
						(err: any) => reject(err)
					);
				});

			dbImpl = {
				initDatabase: async () => {
					await ensureUsersTable();
				},
				getUserById: async (id: number) => {
					if (id == null) return null;
					await ensureUsersTable();
					return await new Promise<UserRow>((resolve, reject) => {
						db.transaction((tx: any) => {
							tx.executeSql(
								'SELECT * FROM users WHERE id = ? LIMIT 1;',
								[id],
								(_tx: any, result: any) => resolve((result.rows as any)._array?.[0] ?? null),
								(_tx: any, err: any) => {
									reject(err);
									return false;
								}
							);
						});
					});
				},
				createUser: async payload => {
					await ensureUsersTable();
					return await new Promise<UserRow>((resolve, reject) => {
						db.transaction((tx: any) => {
							tx.executeSql(
								'INSERT INTO users (email, password, name) VALUES (?, ?, ?);',
								[payload.email, payload.password, payload.name ?? null],
								(_tx: any, result: any) => {
									const insertId = (result as any).insertId;
									tx.executeSql(
										'SELECT * FROM users WHERE id = ? LIMIT 1;',
										[insertId],
										(_tx2: any, res2: any) => resolve((res2.rows as any)._array?.[0] ?? null),
										(_tx2: any, err2: any) => {
											reject(err2);
											return false;
										}
									);
								},
								(_tx: any, err: any) => {
									// if UNIQUE prevents insert, return existing by email
									tx.executeSql(
										'SELECT * FROM users WHERE email = ? LIMIT 1;',
										[payload.email],
										(_tx3: any, res3: any) => resolve((res3.rows as any)._array?.[0] ?? null),
										(_tx3: any, err3: any) => {
											reject(err3);
											return false;
										}
									);
									return false;
								}
							);
						});
					});
				},
				findUserByEmailAndPassword: async (email: string, password: string) => {
					await ensureUsersTable();
					return await new Promise<UserRow>((resolve, reject) => {
						db.transaction((tx: any) => {
							tx.executeSql(
								'SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1;',
								[email, password],
								(_tx: any, result: any) => resolve((result.rows as any)._array?.[0] ?? null),
								(_tx: any, err: any) => {
									reject(err);
									return false;
								}
							);
						});
					});
				},
			};
			return;
		}
	} catch (e) {
		// expo-sqlite not available or failed — fall back to memory implementation
		console.warn('database: expo-sqlite not available, using in-memory fallback', e);
	}

	// In-memory fallback implementation
	(() => {
		let nextId = 1;
		const users = new Map<number, { id: number; email: string; password?: string | null; name?: string | null }>();
		const emailIndex = new Map<string, number>();

		dbImpl = {
			initDatabase: async () => {
				// nothing to do for memory store
			},
			getUserById: async (id: number) => {
				if (id == null) return null;
				return users.get(id) ?? null;
			},
			createUser: async payload => {
				// if email exists, return existing
				const existingId = emailIndex.get(payload.email);
				if (existingId != null) {
					return users.get(existingId) ?? null;
				}
				const id = nextId++;
				const row = { id, email: payload.email, password: payload.password ?? null, name: payload.name ?? null };
				users.set(id, row);
				emailIndex.set(payload.email, id);
				return row;
			},
			findUserByEmailAndPassword: async (email: string, password: string) => {
				const id = emailIndex.get(email);
				if (id == null) return null;
				const u = users.get(id) || null;
				if (!u) return null;
				if ((u.password ?? null) === password) return u;
				return null;
			},
		};
	})();
})();

export default {
	initDatabase: dbImpl.initDatabase,
	getUserById: dbImpl.getUserById,
	createUser: dbImpl.createUser,
	findUserByEmailAndPassword: dbImpl.findUserByEmailAndPassword,
};
