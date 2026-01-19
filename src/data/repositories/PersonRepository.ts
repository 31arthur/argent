import type { Person } from '@/domain/entities/Person';
import type { IPersonRepository } from '@/domain/repositories/IPersonRepository';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Person Repository Implementation
 * Implements IPersonRepository using Firestore
 */
export class PersonRepository implements IPersonRepository {
    private collectionName = 'persons';

    async getAll(userId: string): Promise<Person[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            orderBy('name', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToPerson(doc.id, doc.data()));
    }

    async getById(id: string): Promise<Person | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return this.mapDocToPerson(docSnap.id, docSnap.data());
    }

    async create(person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
        const now = Timestamp.now();

        // Remove undefined fields (Firestore doesn't allow undefined)
        const docData: any = {
            userId: person.userId,
            name: person.name,
            createdAt: now,
            updatedAt: now,
        };

        // Only add optional fields if they have values
        if (person.email) docData.email = person.email;
        if (person.phone) docData.phone = person.phone;
        if (person.profileImageUrl) docData.profileImageUrl = person.profileImageUrl;
        if (person.notes) docData.notes = person.notes;

        const docRef = await addDoc(collection(db, this.collectionName), docData);

        return {
            id: docRef.id,
            ...person,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
        };
    }

    async update(id: string, person: Partial<Person>): Promise<Person> {
        const docRef = doc(db, this.collectionName, id);
        const now = Timestamp.now();

        // Remove undefined fields (Firestore doesn't allow undefined)
        const updateData: any = {
            updatedAt: now,
        };

        // Only add fields that have values
        if (person.name !== undefined) updateData.name = person.name;
        if (person.email !== undefined) updateData.email = person.email;
        if (person.phone !== undefined) updateData.phone = person.phone;
        if (person.profileImageUrl !== undefined) updateData.profileImageUrl = person.profileImageUrl;
        if (person.notes !== undefined) updateData.notes = person.notes;

        await updateDoc(docRef, updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Person with id ${id} not found after update`);
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }

    private mapDocToPerson(id: string, data: any): Person {
        return {
            id,
            userId: data.userId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            profileImageUrl: data.profileImageUrl,
            notes: data.notes,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    }
}
