import type { Firestore } from 'firebase/firestore';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import type { TransactionDraft } from '@/domain/entities/TransactionDraft';
import type { ITransactionDraftRepository } from '@/domain/repositories/ITransactionDraftRepository';
import { DraftStatus } from '@/domain/entities/DraftStatus';
import type { TransactionData } from '@/domain/value-objects/TransactionData';

/**
 * Firestore Document Type
 */
interface TransactionDraftDoc {
    userId: string;
    conversationId: string;
    status: DraftStatus;
    extractedFields: Record<string, unknown>;
    confidenceMap: Record<string, number>;
    missingFields: string[];
    isDeleted: boolean;
    confirmedAt: Timestamp | null;
    cancelledAt: Timestamp | null;
    finalizedAt: Timestamp | null;
    transactionId: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/**
 * Repository Implementation: TransactionDraftRepository
 * Firestore implementation of ITransactionDraftRepository
 * 
 * COLLECTION: 'transactionDrafts'
 * 
 * REQUIRED FIRESTORE INDEXES:
 * - userId + createdAt (descending)
 * - conversationId + status
 */
export class TransactionDraftRepository implements ITransactionDraftRepository {
    private collectionRef;

    constructor(private firestore: Firestore) {
        this.collectionRef = collection(firestore, 'transactionDrafts');
    }

    async getById(id: string): Promise<TransactionDraft | null> {
        try {
            const docRef = doc(this.firestore, 'transactionDrafts', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return this.convertFromFirestore(id, docSnap.data() as TransactionDraftDoc);
        } catch (error) {
            console.error('[TransactionDraftRepository] Error getting draft by ID:', error);
            throw error;
        }
    }

    async getByConversation(conversationId: string): Promise<TransactionDraft | null> {
        try {
            const q = query(
                this.collectionRef,
                where('conversationId', '==', conversationId),
                where('isDeleted', '==', false),
                orderBy('createdAt', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const docSnap = querySnapshot.docs[0];
            return this.convertFromFirestore(docSnap.id, docSnap.data() as TransactionDraftDoc);
        } catch (error) {
            console.error('[TransactionDraftRepository] Error getting draft by conversation:', error);
            throw error;
        }
    }

    async getAllByUser(userId: string): Promise<TransactionDraft[]> {
        try {
            const q = query(
                this.collectionRef,
                where('userId', '==', userId),
                where('isDeleted', '==', false),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map((docSnap) =>
                this.convertFromFirestore(docSnap.id, docSnap.data() as TransactionDraftDoc)
            );
        } catch (error) {
            console.error('[TransactionDraftRepository] Error getting drafts by user:', error);
            throw error;
        }
    }

    async create(
        draft: Omit<TransactionDraft, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<TransactionDraft> {
        try {
            const docRef = doc(this.collectionRef);


            const firestoreDoc: Omit<TransactionDraftDoc, 'createdAt' | 'updatedAt'> & {
                createdAt: ReturnType<typeof serverTimestamp>;
                updatedAt: ReturnType<typeof serverTimestamp>;
            } = {
                userId: draft.userId,
                conversationId: draft.conversationId,
                status: draft.status,
                extractedFields: draft.extractedFields as Record<string, unknown>,
                confidenceMap: draft.confidenceMap,
                missingFields: draft.missingFields,
                isDeleted: draft.isDeleted,
                confirmedAt: draft.confirmedAt ? Timestamp.fromDate(draft.confirmedAt) : null,
                cancelledAt: draft.cancelledAt ? Timestamp.fromDate(draft.cancelledAt) : null,
                finalizedAt: draft.finalizedAt ? Timestamp.fromDate(draft.finalizedAt) : null,
                transactionId: draft.transactionId || null,
                createdAt: serverTimestamp() as any,
                updatedAt: serverTimestamp() as any,
            };

            await setDoc(docRef, firestoreDoc);

            // Fetch the created document to get server timestamps
            const createdDoc = await getDoc(docRef);
            if (!createdDoc.exists()) {
                throw new Error('Failed to create draft');
            }

            return this.convertFromFirestore(docRef.id, createdDoc.data() as TransactionDraftDoc);
        } catch (error) {
            console.error('[TransactionDraftRepository] Error creating draft:', error);
            throw error;
        }
    }

    async update(id: string, updates: Partial<TransactionDraft>): Promise<TransactionDraft> {
        try {
            const docRef = doc(this.firestore, 'transactionDrafts', id);

            // Convert updates to Firestore format
            const firestoreUpdates: Partial<TransactionDraftDoc> & {
                updatedAt: ReturnType<typeof serverTimestamp>;
            } = {
                updatedAt: serverTimestamp() as unknown as Timestamp,
            };

            if (updates.status !== undefined) {
                firestoreUpdates.status = updates.status;
            }

            if (updates.extractedFields !== undefined) {
                firestoreUpdates.extractedFields = updates.extractedFields as Record<string, unknown>;
            }

            if (updates.confidenceMap !== undefined) {
                firestoreUpdates.confidenceMap = updates.confidenceMap;
            }

            if (updates.missingFields !== undefined) {
                firestoreUpdates.missingFields = updates.missingFields;
            }

            if (updates.confirmedAt !== undefined) {
                firestoreUpdates.confirmedAt = updates.confirmedAt
                    ? Timestamp.fromDate(updates.confirmedAt)
                    : null;
            }

            if (updates.cancelledAt !== undefined) {
                firestoreUpdates.cancelledAt = updates.cancelledAt
                    ? Timestamp.fromDate(updates.cancelledAt)
                    : null;
            }

            if (updates.finalizedAt !== undefined) {
                firestoreUpdates.finalizedAt = updates.finalizedAt
                    ? Timestamp.fromDate(updates.finalizedAt)
                    : null;
            }

            if (updates.transactionId !== undefined) {
                firestoreUpdates.transactionId = updates.transactionId || null;
            }

            await updateDoc(docRef, firestoreUpdates);

            // Fetch updated document
            const updatedDoc = await getDoc(docRef);
            if (!updatedDoc.exists()) {
                throw new Error('Draft not found after update');
            }

            return this.convertFromFirestore(id, updatedDoc.data() as TransactionDraftDoc);
        } catch (error) {
            console.error('[TransactionDraftRepository] Error updating draft:', error);
            throw error;
        }
    }

    async markAsConfirmed(id: string): Promise<TransactionDraft> {
        return this.update(id, {
            status: DraftStatus.CONFIRMED,
            confirmedAt: new Date(),
        });
    }

    async markAsCancelled(id: string): Promise<TransactionDraft> {
        return this.update(id, {
            status: DraftStatus.CANCELLED,
            cancelledAt: new Date(),
        });
    }

    async markAsFinalized(id: string, transactionId: string): Promise<TransactionDraft> {
        return this.update(id, {
            status: DraftStatus.FINALIZED,
            transactionId,
            finalizedAt: new Date(),
        });
    }

    async softDelete(id: string): Promise<void> {
        try {
            const docRef = doc(this.firestore, 'transactionDrafts', id);
            await updateDoc(docRef, {
                isDeleted: true,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('[TransactionDraftRepository] Error soft deleting draft:', error);
            throw error;
        }
    }

    async permanentDelete(id: string): Promise<void> {
        try {
            const docRef = doc(this.firestore, 'transactionDrafts', id);
            await updateDoc(docRef, {
                isDeleted: true,
                updatedAt: serverTimestamp(),
            });
            // Note: We still soft delete instead of hard delete for audit trail
            // If you want true permanent delete, use deleteDoc(docRef)
        } catch (error) {
            console.error('[TransactionDraftRepository] Error permanently deleting draft:', error);
            throw error;
        }
    }

    /**
     * Convert Firestore document to TransactionDraft entity
     */
    private convertFromFirestore(id: string, doc: TransactionDraftDoc): TransactionDraft {
        return {
            id,
            userId: doc.userId,
            conversationId: doc.conversationId,
            status: doc.status,
            extractedFields: doc.extractedFields as Partial<TransactionData>,
            confidenceMap: doc.confidenceMap,
            missingFields: doc.missingFields,
            isDeleted: doc.isDeleted,
            confirmedAt: doc.confirmedAt ? doc.confirmedAt.toDate() : undefined,
            cancelledAt: doc.cancelledAt ? doc.cancelledAt.toDate() : undefined,
            finalizedAt: doc.finalizedAt ? doc.finalizedAt.toDate() : undefined,
            transactionId: doc.transactionId || undefined,
            createdAt: doc.createdAt.toDate(),
            updatedAt: doc.updatedAt.toDate(),
        };
    }
}
