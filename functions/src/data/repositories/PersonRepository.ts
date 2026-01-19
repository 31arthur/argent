import * as admin from 'firebase-admin';
import type { Person } from '../../domain/entities/Person';
import type { IPersonRepository } from '../../domain/repositories/IPersonRepository';

/**
 * Person Repository Implementation
 * Implements IPersonRepository using Firebase Admin SDK
 * Designed for Cloud Functions deployment
 */
export class PersonRepository implements IPersonRepository {
    private readonly collectionName = 'persons';

    constructor(private firestore: admin.firestore.Firestore) { }

    async getAll(userId: string): Promise<Person[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('isDeleted', '==', false)
            .orderBy('name', 'asc')
            .get();

        return snapshot.docs.map(doc => this.mapToPerson(doc));
    }

    async getById(id: string): Promise<Person | null> {
        const doc = await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .get();

        if (!doc.exists) {
            return null;
        }

        return this.mapToPerson(doc);
    }

    async create(person: Omit<Person, 'id' | 'createdAt'>): Promise<Person> {
        const now = admin.firestore.Timestamp.now();
        const docData = {
            userId: person.userId,
            name: person.name,
            phone: person.phone || null,
            email: person.email || null,
            notes: person.notes || null,
            createdAt: now,
            isDeleted: false,
        };

        const docRef = await this.firestore
            .collection(this.collectionName)
            .add(docData);

        return {
            id: docRef.id,
            userId: docData.userId,
            name: docData.name,
            phone: docData.phone || undefined,
            email: docData.email || undefined,
            notes: docData.notes || undefined,
            createdAt: now.toDate(),
            isDeleted: false,
        };
    }

    async update(id: string, person: Partial<Person>): Promise<Person> {
        const updateData: any = {};

        if (person.name !== undefined) updateData.name = person.name;
        if (person.phone !== undefined) updateData.phone = person.phone || null;
        if (person.email !== undefined) updateData.email = person.email || null;
        if (person.notes !== undefined) updateData.notes = person.notes || null;

        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update(updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Person with id ${id} not found after update`);
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({ isDeleted: true });
    }

    private mapToPerson(doc: admin.firestore.DocumentSnapshot): Person {
        const data = doc.data()!;
        return {
            id: doc.id,
            userId: data.userId,
            name: data.name,
            phone: data.phone || undefined,
            email: data.email || undefined,
            notes: data.notes || undefined,
            createdAt: data.createdAt?.toDate() || new Date(),
            isDeleted: data.isDeleted || false,
        };
    }
}
