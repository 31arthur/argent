import * as admin from 'firebase-admin';
import type { LoanRepayment } from '../../domain/entities/Loan';

/**
 * Loan Repayment Repository Implementation
 * Implements loan repayment data operations using injected Firestore instance
 */
export class LoanRepaymentRepository {
    constructor(private firestore: admin.firestore.Firestore) { }

    async getById(id: string): Promise<LoanRepayment | null> {
        const doc = await this.firestore.collection('loanRepayments').doc(id).get();
        if (!doc.exists) return null;
        return this.mapToLoanRepayment(doc);
    }

    async getByLoanId(loanId: string): Promise<LoanRepayment[]> {
        const snapshot = await this.firestore
            .collection('loanRepayments')
            .where('loanId', '==', loanId)
            .orderBy('date', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToLoanRepayment(doc));
    }

    async create(repayment: Omit<LoanRepayment, 'id' | 'createdAt'>): Promise<LoanRepayment> {
        const docRef = await this.firestore.collection('loanRepayments').add({
            ...repayment,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const doc = await docRef.get();
        return this.mapToLoanRepayment(doc);
    }

    async delete(id: string): Promise<void> {
        await this.firestore.collection('loanRepayments').doc(id).delete();
    }

    private mapToLoanRepayment(doc: admin.firestore.DocumentSnapshot): LoanRepayment {
        const data = doc.data()!;
        return {
            id: doc.id,
            loanId: data.loanId,
            amount: data.amount,
            date: data.date?.toDate() || new Date(),
            linkedTransactionId: data.linkedTransactionId,
            notes: data.notes,
            createdAt: data.createdAt?.toDate() || new Date(),
        };
    }
}
