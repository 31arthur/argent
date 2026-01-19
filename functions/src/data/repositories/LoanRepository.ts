import * as admin from 'firebase-admin';
import type { Loan, LoanDirection, LoanStatus } from '../../domain/entities/Loan';
import type { ILoanRepository } from '../../domain/repositories/ILoanRepository';

/**
 * Loan Repository Implementation
 * Implements ILoanRepository using Firebase Admin SDK
 * Designed for Cloud Functions deployment
 */
export class LoanRepository implements ILoanRepository {
    private readonly collectionName = 'loans';

    constructor(private firestore: admin.firestore.Firestore) { }

    async getAll(userId: string): Promise<Loan[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('isDeleted', '==', false)
            .orderBy('borrowedDate', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToLoan(doc));
    }

    async getById(id: string): Promise<Loan | null> {
        const doc = await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .get();

        if (!doc.exists) {
            return null;
        }

        return this.mapToLoan(doc);
    }

    async getByPerson(userId: string, personId: string): Promise<Loan[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('personId', '==', personId)
            .where('isDeleted', '==', false)
            .orderBy('borrowedDate', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToLoan(doc));
    }

    async getByPersonId(userId: string, personId: string): Promise<Loan[]> {
        return this.getByPerson(userId, personId);
    }

    async getByDirection(userId: string, direction: LoanDirection): Promise<Loan[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('direction', '==', direction)
            .where('isDeleted', '==', false)
            .orderBy('borrowedDate', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToLoan(doc));
    }

    async getByStatus(userId: string, status: LoanStatus): Promise<Loan[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('status', '==', status)
            .where('isDeleted', '==', false)
            .orderBy('borrowedDate', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToLoan(doc));
    }

    async create(loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loan> {
        const now = admin.firestore.Timestamp.now();
        const docData = {
            userId: loan.userId,
            personId: loan.personId,
            direction: loan.direction,
            principalAmount: loan.principalAmount,
            interestRate: loan.interestRate,
            borrowedDate: admin.firestore.Timestamp.fromDate(loan.borrowedDate),
            expectedRepaymentDate: loan.expectedRepaymentDate
                ? admin.firestore.Timestamp.fromDate(loan.expectedRepaymentDate)
                : null,
            actualRepaymentDate: loan.actualRepaymentDate
                ? admin.firestore.Timestamp.fromDate(loan.actualRepaymentDate)
                : null,
            status: loan.status,
            notes: loan.notes || null,
            totalRepaid: loan.totalRepaid,
            outstandingAmount: loan.outstandingAmount,
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
        };

        const docRef = await this.firestore
            .collection(this.collectionName)
            .add(docData);

        return {
            id: docRef.id,
            userId: docData.userId,
            personId: docData.personId,
            direction: docData.direction,
            principalAmount: docData.principalAmount,
            interestRate: docData.interestRate,
            borrowedDate: docData.borrowedDate.toDate(),
            expectedRepaymentDate: docData.expectedRepaymentDate?.toDate(),
            actualRepaymentDate: docData.actualRepaymentDate?.toDate(),
            status: docData.status,
            notes: docData.notes || undefined,
            totalRepaid: docData.totalRepaid,
            outstandingAmount: docData.outstandingAmount,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
            isDeleted: false,
        };
    }

    async update(id: string, loan: Partial<Loan>): Promise<Loan> {
        const updateData: any = {
            updatedAt: admin.firestore.Timestamp.now(),
        };

        if (loan.status !== undefined) updateData.status = loan.status;
        if (loan.totalRepaid !== undefined) updateData.totalRepaid = loan.totalRepaid;
        if (loan.outstandingAmount !== undefined) updateData.outstandingAmount = loan.outstandingAmount;
        if (loan.notes !== undefined) updateData.notes = loan.notes || null;
        if (loan.actualRepaymentDate !== undefined) {
            updateData.actualRepaymentDate = loan.actualRepaymentDate
                ? admin.firestore.Timestamp.fromDate(loan.actualRepaymentDate)
                : null;
        }
        if (loan.expectedRepaymentDate !== undefined) {
            updateData.expectedRepaymentDate = loan.expectedRepaymentDate
                ? admin.firestore.Timestamp.fromDate(loan.expectedRepaymentDate)
                : null;
        }

        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update(updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Loan with id ${id} not found after update`);
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({ isDeleted: true });
    }

    private mapToLoan(doc: admin.firestore.DocumentSnapshot): Loan {
        const data = doc.data()!;
        return {
            id: doc.id,
            userId: data.userId,
            personId: data.personId,
            direction: data.direction,
            principalAmount: data.principalAmount,
            interestRate: data.interestRate,
            borrowedDate: data.borrowedDate?.toDate() || new Date(),
            expectedRepaymentDate: data.expectedRepaymentDate?.toDate(),
            actualRepaymentDate: data.actualRepaymentDate?.toDate(),
            status: data.status,
            notes: data.notes || undefined,
            totalRepaid: data.totalRepaid,
            outstandingAmount: data.outstandingAmount,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            isDeleted: data.isDeleted || false,
        };
    }
}
