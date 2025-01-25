import type {  gameState, Statistics,  MistakeCount,  SudokuCell,  TimeCount } from "./types"

const DB_NAME = "sudokusuDB"
export const GAME_STORE = "gameState"
export const TIME_STORE = "timeState"
export const STATS_STORE = "statsState"
const DB_VERSION = 2


export type gameStateType = {
    size: number;
    mistakes: MistakeCount;
    sudoku: (number | {
        guess: number[];
        x: number;
        y: number;
        val: number;
        isFixed: boolean;
        isValid: boolean;
        solution: number;
    })[][];
    remainingNumbers: [number,number][];
} 

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
			if (!db.objectStoreNames.contains(STATS_STORE)) {
				db.createObjectStore(STATS_STORE)
			}
		}
	})
}

export async function saveStats(stats: Statistics): Promise<void> {
    try {
        const plainStats = JSON.parse(JSON.stringify(stats))
        const db = await openDB()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STATS_STORE, "readwrite")
            const store = transaction.objectStore(STATS_STORE)
            const request = store.put(plainStats, "gameStats")

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
            transaction.oncomplete = () => db.close()
        })
    } catch (error) {
        console.error("Error saving stats:", error)
    }
}

export async function loadStats(): Promise<Statistics | null> {
    try {
        const db = await openDB()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STATS_STORE, "readonly")
            const store = transaction.objectStore(STATS_STORE)
            const request = store.get("gameStats")

            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
            transaction.oncomplete = () => db.close()
        })
    } catch (error) {
        console.error("Error loading stats:", error)
        return null
    }
}

export async function saveTime(time: TimeCount): Promise<void> {
	try {
		const plaintime = JSON.parse(JSON.stringify(time))
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
	value: gameStateType | Statistics,
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

export async function fetchFromIndexedDB(key: string): Promise<gameStateType | Statistics> {
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
