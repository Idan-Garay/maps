'use server'
import { db } from './db'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

// when moving features under a user
export const getFeatures = async (id = 'uwIyeyedBtwzPmWULbIs') => {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'features')))
    return querySnapshot.docs.map((doc) => doc.data())
  } catch (e) {
    console.log(e)
    return []
  }
}

export const getFeatureCollection = async (
  userId = 'uwIyeyedBtwzPmWULbIs',
  featureCollectionId = 'aKtyIjmvrYbTcoqTjUb0'
) => {
  try {
    const userDocRef = doc(db, 'user', userId)
    const featureCollectionDoc = doc(
      userDocRef,
      'featureCollection',
      featureCollectionId
    )
    const featureDocs = await getDocs(
      query(collection(featureCollectionDoc, 'features'))
    )
    const features = featureDocs.docs.map((item) => item.data())
    return features
  } catch (e) {
    console.log(e)
    return []
  }
}

export const putFeatureToCollection = async (
  jsonString: string,
  userId = 'uwIyeyedBtwzPmWULbIs',
  featureCollectionId = 'aKtyIjmvrYbTcoqTjUb0'
) => {
  try {
    const json = JSON.parse(jsonString)
    json.geometry.coordinates = JSON.stringify(json.geometry.coordinates)
    const userDocRef = doc(db, 'user', userId)
    const featureCollectionDoc = doc(
      userDocRef,
      'featureCollection',
      featureCollectionId
    )
    const featureDoc = doc(featureCollectionDoc, 'features', json.id)
    await setDoc(featureDoc, json, { merge: true })
      .then((data) => true)
      .catch((e) => {
        console.log('failed', e)
        return false
      })

    return true
  } catch (e) {
    console.log(e)
    return []
  }
}

export const putFeature = async (jsonString: string) => {
  const json = JSON.parse(jsonString)
  json.geometry.coordinates = JSON.stringify(json.geometry.coordinates)

  try {
    await setDoc(doc(db, 'features', json.id), json, {
      merge: true,
    })
      .then((data) => console.log('success', data))
      .catch((data) => console.log('failed', data))
    return true
  } catch (e) {
    console.log(e)
    return null
  }
}
