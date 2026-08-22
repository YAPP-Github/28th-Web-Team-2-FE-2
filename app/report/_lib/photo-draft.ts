"use client";

const DATABASE_NAME = "marketgo-report-draft";
const DATABASE_VERSION = 1;
const STORE_NAME = "photos";
const PHOTO_KEY = "current";
const MAX_AGE_MS = 30 * 60 * 1000;

interface StoredPhoto {
  blob: Blob;
  name: string;
  type: string;
  lastModified: number;
  savedAt: number;
}

export interface ReportPhotoDraft {
  file: File;
}

let memoryFallback: ReportPhotoDraft | null = null;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB를 사용할 수 없어요."));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("사진 임시 저장에 실패했어요."));
  });
}

function closeAfter<T>(database: IDBDatabase, request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      database.close();
      resolve(request.result);
    };
    request.onerror = () => {
      database.close();
      reject(request.error ?? new Error("사진 임시 저장에 실패했어요."));
    };
  });
}

/** 품목 선택 화면으로 이동해도 원본 File을 잃지 않도록 브라우저에 잠시 보관한다. */
export async function saveReportPhoto(file: File): Promise<void> {
  memoryFallback = { file };
  try {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const value: StoredPhoto = {
      blob: file.slice(0, file.size, file.type),
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      savedAt: Date.now(),
    };
    await closeAfter(database, transaction.objectStore(STORE_NAME).put(value, PHOTO_KEY));
  } catch {
    // 브라우저가 IndexedDB를 막아도 같은 문서 안에서는 memoryFallback으로 동작한다.
  }
}

export async function loadReportPhoto(): Promise<ReportPhotoDraft | null> {
  try {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readonly");
    const stored = await closeAfter(
      database,
      transaction.objectStore(STORE_NAME).get(PHOTO_KEY),
    ) as StoredPhoto | undefined;
    if (!stored || Date.now() - stored.savedAt > MAX_AGE_MS) {
      await clearReportPhoto();
      return memoryFallback;
    }

    const file = new File([stored.blob], stored.name, {
      type: stored.type,
      lastModified: stored.lastModified,
    });
    memoryFallback = { file };
    return memoryFallback;
  } catch {
    return memoryFallback;
  }
}

export async function clearReportPhoto(): Promise<void> {
  memoryFallback = null;
  try {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    await closeAfter(database, transaction.objectStore(STORE_NAME).delete(PHOTO_KEY));
  } catch {
    // 이미 지워졌거나 IndexedDB를 사용할 수 없는 환경이면 메모리 폴백만 비운다.
  }
}
