import type { gameState, MistakeCount, SudokuCell, TimeCount } from "./types"

const DB_NAME = "sudokusuDB"
export const GAME_STORE = "gameState"
export const TIME_STORE = "timeState"
const DB_VERSION = 1

async function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION)

		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve(request.result)

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result
			// Create separate stores
			if (!db.objectStoreNames.contains(GAME_STORE)) {
				db.createObjectStore(GAME_STORE)
			}
			if (!db.objectStoreNames.contains(TIME_STORE)) {
				db.createObjectStore(TIME_STORE)
			}
		}
	})
}
// Specific function for saving time
export async function saveTime(time: TimeCount): Promise<void> {
	try {
		const plaintime = JSON.parse(JSON.stringify(time))
		// console.log("plaintime", plaintime)
		const db = await openDB()
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(TIME_STORE, "readwrite")
			const store = transaction.objectStore(TIME_STORE)
			const request = store.put(plaintime, "timeCount")

			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)
			transaction.oncomplete = () => db.close()
		})
	} catch (error) {
		console.error("Error saving time:", error)
	}
}

// Specific function for loading time
export async function loadTime(): Promise<TimeCount> {
	try {
		const db = await openDB()
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(TIME_STORE, "readonly")
			const store = transaction.objectStore(TIME_STORE)
			const request = store.get("timeCount")

			request.onsuccess = () => resolve(request.result || 0)
			request.onerror = () => reject(request.error)
			transaction.oncomplete = () => db.close()
		})
	} catch (error) {
		console.error("Error loading time:", error)
		return { timeElapsed: 0, totalTime: 0 }
	}
}

export async function storeInIndexedDB(
	key: string,
	value: gameState,
): Promise<void> {
	try {
		const plainValue = JSON.parse(JSON.stringify(value))
		const db = await openDB()
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(GAME_STORE, "readwrite")
			const store = transaction.objectStore(GAME_STORE)
			const request = store.put(plainValue, key)

			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)
			transaction.oncomplete = () => db.close()
		})
	} catch (error) {
		console.error("Error storing game state:", error)
	}
}

export async function fetchFromIndexedDB(key: string): Promise<gameState> {
	try {
		const db = await openDB()
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(GAME_STORE, "readonly")
			const store = transaction.objectStore(GAME_STORE)

			const request = store.get(key)

			request.onsuccess = () => resolve(request.result)
			request.onerror = () => reject(request.error)

			transaction.oncomplete = () => db.close()
		})
	} catch (error) {
		console.error("Error fetching data from IndexedDB:", error)
		throw error
	}
}

export async function removeFromIndexedDB(key: string): Promise<void> {
	try {
		const db = await openDB()
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(GAME_STORE, "readwrite")
			const store = transaction.objectStore(GAME_STORE)

			const request = store.delete(key)

			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)

			transaction.oncomplete = () => db.close()
		})
	} catch (error) {
		console.error("Error removing data from IndexedDB:", error)
		throw error
	}
}

export async function clearIndexedDB(): Promise<void> {
	try {
		const db = await openDB()
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(GAME_STORE, "readwrite")
			const store = transaction.objectStore(GAME_STORE)

			const request = store.clear()

			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)

			transaction.oncomplete = () => db.close()
		})
	} catch (error) {
		console.error("Error clearing IndexedDB:", error)
		throw error
	}
}
