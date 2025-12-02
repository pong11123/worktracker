import { Task, Status, Priority } from '../types';
import { db } from '../firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';

const COLLECTION_NAME = 'tasks';

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('dateReceived', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
    } catch (error) {
      console.error("Error getting documents: ", error);
      return [];
    }
  },

  add: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const newTaskData = {
      ...task,
      documentNumber: task.documentNumber || '-',
      building: task.building || '-',
      floor: task.floor || '-',
      details: task.details || '',
      dateReceived: task.dateReceived || new Date().toISOString(),
      dateCompleted: task.status === Status.COMPLETED ? new Date().toISOString() : null,
      budget: task.budget || ''
    };

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newTaskData);
      return { id: docRef.id, ...newTaskData } as Task;
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
    }
  },

  update: async (task: Task): Promise<Task> => {
    try {
      const taskRef = doc(db, COLLECTION_NAME, task.id);
      
      // Determine if dateCompleted needs update based on status logic
      let dateCompleted = task.dateCompleted;

      // Simplistic check: If sending COMPLETED and no date, set it. 
      if (task.status === Status.COMPLETED && !dateCompleted) {
        dateCompleted = new Date().toISOString();
      }
      
      // If status is NOT completed, clear the date
      if (task.status !== Status.COMPLETED) {
        dateCompleted = null;
      }

      const updateData = { ...task, dateCompleted };
      // Remove id from payload
      const { id, ...dataToUpdate } = updateData;

      await updateDoc(taskRef, dataToUpdate);
      return updateData;
    } catch (error) {
      console.error("Error updating document: ", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      throw error;
    }
  }
};