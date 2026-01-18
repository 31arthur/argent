import * as admin from 'firebase-admin';
import { AgentConversation } from '../../domain/entities/AgentConversation';
import { AgentState } from '../../domain/entities/AgentState';
import { IAgentConversationRepository } from '../../domain/repositories/IAgentConversationRepository';

/**
 * Firestore Document Type
 */
interface AgentConversationDoc {
    userId: string;
    agentState: AgentState;
    activeDraftId: string | null;
    isDeleted: boolean;
    completedAt: admin.firestore.Timestamp | null;
    startedAt: admin.firestore.Timestamp;
    lastActivityAt: admin.firestore.Timestamp;
}

/**
 * Firebase Admin Firestore Implementation
 */
export class AgentConversationRepository implements IAgentConversationRepository {
    private collectionRef: admin.firestore.CollectionReference;

    constructor(private firestore: admin.firestore.Firestore) {
        this.collectionRef = firestore.collection('agentConversations');
    }

    async getById(id: string): Promise<AgentConversation | null> {
        const docRef = this.collectionRef.doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return null;
        }

        return this.convertFromFirestore(id, docSnap.data() as AgentConversationDoc);
    }

    async getActiveByUser(userId: string): Promise<AgentConversation | null> {
        const q = this.collectionRef
            .where('userId', '==', userId)
            .where('isDeleted', '==', false)
            .where('agentState', 'in', [
                AgentState.IDLE,
                AgentState.EXTRACTING,
                AgentState.ASKING_CLARIFICATION,
                AgentState.WAITING_CONFIRMATION,
            ])
            .orderBy('lastActivityAt', 'desc')
            .limit(1);

        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            return null;
        }

        const docSnap = querySnapshot.docs[0];
        return this.convertFromFirestore(docSnap.id, docSnap.data() as AgentConversationDoc);
    }

    async getAllByUser(userId: string): Promise<AgentConversation[]> {
        const q = this.collectionRef
            .where('userId', '==', userId)
            .where('isDeleted', '==', false)
            .orderBy('lastActivityAt', 'desc');

        const querySnapshot = await q.get();

        return querySnapshot.docs.map((docSnap) =>
            this.convertFromFirestore(docSnap.id, docSnap.data() as AgentConversationDoc)
        );
    }

    async create(
        conversation: Omit<AgentConversation, 'id' | 'startedAt' | 'lastActivityAt'>
    ): Promise<AgentConversation> {
        const docRef = this.collectionRef.doc();
        const now = admin.firestore.FieldValue.serverTimestamp();

        const firestoreDoc = {
            userId: conversation.userId,
            agentState: conversation.agentState,
            activeDraftId: conversation.activeDraftId,
            isDeleted: conversation.isDeleted,
            completedAt: conversation.completedAt
                ? admin.firestore.Timestamp.fromDate(conversation.completedAt)
                : null,
            startedAt: now,
            lastActivityAt: now,
        };

        await docRef.set(firestoreDoc);

        // Fetch the created document
        const createdDoc = await docRef.get();
        if (!createdDoc.exists) {
            throw new Error('Failed to create conversation');
        }

        return this.convertFromFirestore(docRef.id, createdDoc.data() as AgentConversationDoc);
    }

    async updateState(id: string, newState: AgentState): Promise<AgentConversation> {
        const docRef = this.collectionRef.doc(id);

        await docRef.update({
            agentState: newState,
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            throw new Error('Conversation not found after update');
        }

        return this.convertFromFirestore(id, updatedDoc.data() as AgentConversationDoc);
    }

    async updateActivity(id: string): Promise<AgentConversation> {
        const docRef = this.collectionRef.doc(id);

        await docRef.update({
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            throw new Error('Conversation not found after update');
        }

        return this.convertFromFirestore(id, updatedDoc.data() as AgentConversationDoc);
    }

    async updateActiveDraftId(id: string, draftId: string): Promise<AgentConversation> {
        const docRef = this.collectionRef.doc(id);

        await docRef.update({
            activeDraftId: draftId,
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            throw new Error('Conversation not found after update');
        }

        return this.convertFromFirestore(id, updatedDoc.data() as AgentConversationDoc);
    }

    async markAsCompleted(id: string): Promise<AgentConversation> {
        const docRef = this.collectionRef.doc(id);

        await docRef.update({
            agentState: AgentState.COMPLETED,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            throw new Error('Conversation not found after update');
        }

        return this.convertFromFirestore(id, updatedDoc.data() as AgentConversationDoc);
    }

    async markAsCancelled(id: string): Promise<AgentConversation> {
        const docRef = this.collectionRef.doc(id);

        await docRef.update({
            agentState: AgentState.CANCELLED,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            throw new Error('Conversation not found after update');
        }

        return this.convertFromFirestore(id, updatedDoc.data() as AgentConversationDoc);
    }

    async softDelete(id: string): Promise<void> {
        const docRef = this.collectionRef.doc(id);
        await docRef.update({
            isDeleted: true,
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    private convertFromFirestore(id: string, doc: AgentConversationDoc): AgentConversation {
        return {
            id,
            userId: doc.userId,
            agentState: doc.agentState,
            activeDraftId: doc.activeDraftId,
            isDeleted: doc.isDeleted,
            completedAt: doc.completedAt ? doc.completedAt.toDate() : null,
            startedAt: doc.startedAt.toDate(),
            lastActivityAt: doc.lastActivityAt.toDate(),
        };
    }
}
