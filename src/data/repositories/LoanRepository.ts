import type { Loan, LoanDirection, LoanStatus } from '@/domain/entities/Loan';
import type { ILoanRepository } from '@/domain/repositories/ILoanRepository';
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
 * Loan Repository Implementation
 * Implements ILoanRepository using Firestore
 */
export class LoanRepository implements ILoanRepository {
    private collectionName = 'loans';

    async getAll(userId: string): Promise<Loan[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToLoan(doc.id, doc.data()));
    }

    async getById(id: string): Promise<Loan | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return this.mapDocToLoan(docSnap.id, docSnap.data());
    }

    async getByPersonId(personId: string): Promise<Loan[]> {
        const q = query(
            collection(db, this.collectionName),
            where('personId', '==', personId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToLoan(doc.id, doc.data()));
    }

    async getByDirection(userId: string, direction: LoanDirection): Promise<Loan[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('direction', '==', direction),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToLoan(doc.id, doc.data()));
    }

    async getByStatus(userId: string, status: LoanStatus): Promise<Loan[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToLoan(doc.id, doc.data()));
    }

    async create(loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loan> {
        const now = Timestamp.now();
        const docData = {
            ...loan,
            borrowedDate: Timestamp.fromDate(loan.borrowedDate),
            expectedRepaymentDate: loan.expectedRepaymentDate ? Timestamp.fromDate(loan.expectedRepaymentDate) : null,
            actualRepaymentDate: loan.actualRepaymentDate ? Timestamp.fromDate(loan.actualRepaymentDate) : null,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await addDoc(collection(db, this.collectionName), docData);

        return {
            id: docRef.id,
            ...loan,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
        };
    }

    async update(id: string, loan: Partial<Loan>): Promise<Loan> {
        const docRef = doc(db, this.collectionName, id);
        const now = Timestamp.now();

        const updateData: any = {
            ...loan,
            updatedAt: now,
        };

        // Convert dates to Timestamps
        if (loan.borrowedDate) {
            updateData.borrowedDate = Timestamp.fromDate(loan.borrowedDate);
        }
        if (loan.expectedRepaymentDate) {
            updateData.expectedRepaymentDate = Timestamp.fromDate(loan.expectedRepaymentDate);
        }
        if (loan.actualRepaymentDate) {
            updateData.actualRepaymentDate = Timestamp.fromDate(loan.actualRepaymentDate);
        }

        await updateDoc(docRef, updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Loan with id ${id} not found after update`);
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }

    private mapDocToLoan(id: string, data: any): Loan {
        return {
            id,
            userId: data.userId,
            personId: data.personId,
            direction: data.direction,
            principalAmount: data.principalAmount,
            interestRate: data.interestRate,
            borrowedDate: data.borrowedDate?.toDate() || new Date(),
            expectedRepaymentDate: data.expectedRepaymentDate?.toDate(),
            actualRepaymentDate: data.actualRepaymentDate?.toDate(),
            status: data.status,
            notes: data.notes,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    }
}
