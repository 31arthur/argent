import type { Lead, LeadStatus } from '@/domain/entities/Lead';
import type { ILeadRepository } from '@/domain/repositories/ILeadRepository';
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
 * Lead Repository Implementation
 * Implements ILeadRepository using Firestore
 */
export class LeadRepository implements ILeadRepository {
    private collectionName = 'leads';

    async getAll(userId: string): Promise<Lead[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToLead(doc.id, doc.data()));
    }

    async getById(id: string): Promise<Lead | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return this.mapDocToLead(docSnap.id, docSnap.data());
    }

    async getByStatus(userId: string, status: LeadStatus): Promise<Lead[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('status', '==', status),
            orderBy('expectedCloseDate', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToLead(doc.id, doc.data()));
    }

    async getOpenLeads(userId: string): Promise<Lead[]> {
        return this.getByStatus(userId, 'OPEN');
    }

    async create(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
        const now = Timestamp.now();
        const docData = {
            ...lead,
            expectedCloseDate: lead.expectedCloseDate ? Timestamp.fromDate(lead.expectedCloseDate) : null,
            closedAt: lead.closedAt ? Timestamp.fromDate(lead.closedAt) : null,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await addDoc(collection(db, this.collectionName), docData);

        return {
            id: docRef.id,
            ...lead,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
        };
    }

    async update(id: string, lead: Partial<Lead>): Promise<Lead> {
        const docRef = doc(db, this.collectionName, id);
        const now = Timestamp.now();

        const updateData: any = {
            ...lead,
            updatedAt: now,
        };

        // Convert dates to Timestamps
        if (lead.expectedCloseDate) {
            updateData.expectedCloseDate = Timestamp.fromDate(lead.expectedCloseDate);
        }
        if (lead.closedAt) {
            updateData.closedAt = Timestamp.fromDate(lead.closedAt);
        }

        await updateDoc(docRef, updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Lead with id ${id} not found after update`);
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }

    private mapDocToLead(id: string, data: any): Lead {
        return {
            id,
            userId: data.userId,
            title: data.title,
            source: data.source,
            expectedAmount: data.expectedAmount,
            probability: data.probability,
            expectedCloseDate: data.expectedCloseDate?.toDate(),
            status: data.status,
            notes: data.notes,
            tags: data.tags || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            closedAt: data.closedAt?.toDate(),
        };
    }
}
