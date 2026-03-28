let firestorePromise

async function getFirestore() {
  if (!firestorePromise) {
    firestorePromise = import('@google-cloud/firestore')
      .then(({ Firestore }) => new Firestore())
      .catch((error) => {
        console.warn('Firestore unavailable:', error?.message || error)
        return null
      })
  }

  return firestorePromise
}

function getSessionId(sessionId) {
  return sessionId?.trim() || 'anonymous'
}

function buildHistoryEntry(feature, teacherInput, output) {
  return {
    feature,
    title: output.title || output.topic || `${feature} result`,
    topic: output.topic || '',
    summary:
      output.summary ||
      output.overview ||
      output.instructions ||
      output.lesson_plan?.[0] ||
      '',
    teacherInputPreview: teacherInput.slice(0, 180),
    createdAt: new Date().toISOString(),
  }
}

export async function saveHistoryEntry({ sessionId, feature, teacherInput, output }) {
  try {
    const firestore = await getFirestore()
    if (!firestore) return

    await firestore
      .collection('sessions')
      .doc(getSessionId(sessionId))
      .collection('history')
      .add(buildHistoryEntry(feature, teacherInput, output))
  } catch (error) {
    console.warn('Failed to save history entry:', error?.message || error)
  }
}

export async function listHistoryEntries(sessionId, limit = 8) {
  try {
    const firestore = await getFirestore()
    if (!firestore) return []

    const snapshot = await firestore
      .collection('sessions')
      .doc(getSessionId(sessionId))
      .collection('history')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.warn('Failed to load history entries:', error?.message || error)
    return []
  }
}
