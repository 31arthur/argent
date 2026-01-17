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
import type { AgentConversation } from '@/domain/entities/AgentConversation';
import { AgentState } from '@/domain/entities/AgentState';
import type { IAgentConversationRepository } from '@/domain/repositories/IAgentConversationRepository';

/**
 * Firestore Document Type
 */
interface AgentConversationDoc {
    userId: string;
    agentState: AgentState;
    activeDraftId: string | null;
    isDeleted: boolean;
    completedAt: Timestamp | null;
    startedAt: Timestamp;
    lastActivityAt: Timestamp;
}

/**
 * Repository Implementation: AgentConversationRepository
 * Firestore implementation of IAgentConversationRepository
 * 
 * COLLECTION: 'agentConversations'
 * 
 * REQUIRED FIRESTORE INDEXES:
 * - userId + lastActivityAt (descending)
 * - userId + agentState
 */
export class AgentConversationRepository implements IAgentConversationRepository {
    private collectionRef;

    constructor(private firestore: Firestore) {
        this.collectionRef = collection(firestore, 'agentConversations');
    }

    async getById(id: string): Promise<AgentConversation | null> {
        try {
            const docRef = doc(this.firestore, 'agentConversations', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return this.convertFromFirestore(id, docSnap.data() as AgentConversationDoc);
        } catch (error) {
            console.error('[AgentConversationRepository] Error getting conversation by ID:', error);
            throw error;
        }
    }

    async getActiveByUser(userId: string): Promise<AgentConversation | null> {
        try {
            const q = query(
                this.collectionRef,
                where('userId', '==', userId),
                where('isDeleted', '==', false),
                where('agentState', 'in', [
                    AgentState.IDLE,
                    AgentState.EXTRACTING,
                    AgentState.ASKING_CLARIFICATION,
                    AgentState.WAITING_CONFIRMATION,
                ]),
                orderBy('lastActivityAt', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const docSnap = querySnapshot.docs[0];
            return this.convertFromFirestore(docSnap.id, docSnap.data() as AgentConversationDoc);
        } catch (error) {
            console.error('[AgentConversationRepository] Error getting active conversation:', error);
            throw error;
        }
    }

    async getAllByUser(userId: string): Promise<AgentConversation[]> {
        try {
            const q = query(
                this.collectionRef,
                where('userId', '==', userId),
                where('isDeleted', '==', false),
                orderBy('lastActivityAt', 'desc')
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map((docSnap) =>
                this.convertFromFirestore(docSnap.id, docSnap.data() as AgentConversationDoc)
            );
        } catch (error) {
            console.error('[AgentConversationRepository] Error getting conversations by user:', error);
            throw error;
        }
    }

    async create(
        conversation: Omit<AgentConversation, 'id' | 'startedAt' | 'lastActivityAt'>
    ): Promise<AgentConversation> {
        try {
            const docRef = doc(this.collectionRef);
            const now = serverTimestamp();

            const firestoreDoc: Omit<AgentConversationDoc, 'startedAt' | 'lastActivityAt'> & {
                startedAt: ReturnType<typeof serverTimestamp>;
                lastActivityAt: ReturnType<typeof serverTimestamp>;
            } = {
                userId: conversation.userId,
                agentState: conversation.agentState,
                activeDraftId: conversation.activeDraftId,
                isDeleted: conversation.isDeleted,
                completedAt: conversation.completedAt
                    ? Timestamp.fromDate(conversation.completedAt)
                    : null,
                startedAt: now,
                lastActivityAt: now,
            };

            await setDoc(docRef, firestoreDoc);

            // Fetch the created document to get server timestamps
            const createdDoc = await getDoc(docRef);
            if (!createdDoc.exists()) {
                throw new Error('Failed to create conversation');
            }

            return this.convertFromFirestore(docRef.id, createdDoc.data() as AgentConversationDoc);
        } catch (error) {
            console.error('[AgentConversationRepository] Error creating conversation:', error);
            throw error;
        }
    }

    async updateState(id: string, newState: AgentState): Promise<AgentConversation> {
        try {
            const docRef = doc(this.firestore, 'agentConversations', id);

            await updateDoc(docRef, {
                agentState: newState,
                lastActivityAt: serverTimestamp(),
            });

            // Fetch updated document
            const updatedDoc = await getDoc(docRef);
            if (!updatedDoc.exists()) {
                throw new Error('Conversation not found after update');
            }

            return this.convertFromFirestore(id, updatedDoc.data() as AgentConversationDoc);
        } catch (error) {
            console.error('[AgentConversationRepository] Error updating conversation state:', error);
            throw error;
        }
    }

    async updateActivity(id: string): Promise<AgentConversation> {
        try {
            const docRef = doc(this.firestore, 'agentConversations', id);

            await updateDoc(docRef, {
                lastActivityAt: serverTimestamp(),
            });

            // Fetch updated document
            const updatedDoc = await getDoc(docRef);
            if (!updatedDoc.exists()) {
                throw new Error('Conversation not found after update');
            }

            return this.convertFromFirestore(id, updatedDoc.data() as AgentConversationDoc);
        } catch (error) {
            console.error('[AgentConversationRepository] Error updating conversation activity:', error);
            throw error;
        }
    }

    async markAsCompleted(id: string): Promise<AgentConversation> {
        try {
            const docRef = doc(this.firestore, 'agentConversations', id);

            await updateDoc(docRef, {
                agentState: AgentState.COMPLETED,
                completedAt: serverTimestamp(),
                lastActivityAt: serverTimestamp(),
            });

            // Fetch updated document
            const updatedDoc = await getDoc(docRef);
            if (!updatedDoc.exists()) {
                throw new Error('Conversation not found after update');
            }

            return this.convertFromFirestore(id, updatedDoc.data() as AgentConversationDoc);
        } catch (error) {
            console.error('[AgentConversationRepository] Error marking conversation as completed:', error);
            throw error;
        }
    }

    async markAsCancelled(id: string): Promise<AgentConversation> {
        try {
            const docRef = doc(this.firestore, 'agentConversations', id);

            await updateDoc(docRef, {
                agentState: AgentState.CANCELLED,
                completedAt: serverTimestamp(),
                lastActivityAt: serverTimestamp(),
            });

            // Fetch updated document
            const updatedDoc = await getDoc(docRef);
            if (!updatedDoc.exists()) {
                throw new Error('Conversation not found after update');
            }

            return this.convertFromFirestore(id, updatedDoc.data() as AgentConversationDoc);
        } catch (error) {
            console.error('[AgentConversationRepository] Error marking conversation as cancelled:', error);
            throw error;
        }
    }

    async softDelete(id: string): Promise<void> {
        try {
            const docRef = doc(this.firestore, 'agentConversations', id);
            await updateDoc(docRef, {
                isDeleted: true,
                lastActivityAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('[AgentConversationRepository] Error soft deleting conversation:', error);
            throw error;
        }
    }

    /**
     * Convert Firestore document to AgentConversation entity
     */
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
