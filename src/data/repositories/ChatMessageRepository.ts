import type { Firestore } from 'firebase/firestore';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    query,
    where,
    orderBy,
    writeBatch,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import type { ChatMessage } from '@/domain/entities/ChatMessage';
import type { IChatMessageRepository } from '@/domain/repositories/IChatMessageRepository';

/**
 * Firestore Document Type
 */
interface ChatMessageDoc {
    conversationId: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Timestamp;
}

/**
 * Repository Implementation: ChatMessageRepository
 * Firestore implementation of IChatMessageRepository
 * 
 * COLLECTION: 'chatMessages'
 * 
 * REQUIRED FIRESTORE INDEXES:
 * - conversationId + timestamp (ascending)
 * 
 * PURPOSE:
 * - Store UI chat history
 * - Enable conversation display
 * - Provide audit trail
 */
export class ChatMessageRepository implements IChatMessageRepository {
    private collectionRef;

    constructor(private firestore: Firestore) {
        this.collectionRef = collection(firestore, 'chatMessages');
    }

    async getByConversation(conversationId: string): Promise<ChatMessage[]> {
        try {
            const q = query(
                this.collectionRef,
                where('conversationId', '==', conversationId),
                orderBy('timestamp', 'asc')
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map((docSnap) =>
                this.convertFromFirestore(docSnap.id, docSnap.data() as ChatMessageDoc)
            );
        } catch (error) {
            console.error('[ChatMessageRepository] Error getting messages by conversation:', error);
            throw error;
        }
    }

    async create(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
        try {
            const docRef = doc(this.collectionRef);

            const firestoreDoc: Omit<ChatMessageDoc, 'timestamp'> & {
                timestamp: ReturnType<typeof serverTimestamp>;
            } = {
                conversationId: message.conversationId,
                role: message.sender,
                content: message.content,
                timestamp: serverTimestamp(),
            };

            await setDoc(docRef, firestoreDoc);

            // Return message with current timestamp (approximate)
            return {
                id: docRef.id,
                conversationId: message.conversationId,
                sender: message.sender,
                content: message.content,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('[ChatMessageRepository] Error creating message:', error);
            throw error;
        }
    }

    async deleteByConversation(conversationId: string): Promise<void> {
        try {
            const q = query(this.collectionRef, where('conversationId', '==', conversationId));

            const querySnapshot = await getDocs(q);

            // Use batch delete for efficiency
            const batch = writeBatch(this.firestore);

            querySnapshot.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
            });

            await batch.commit();
        } catch (error) {
            console.error('[ChatMessageRepository] Error deleting messages by conversation:', error);
            throw error;
        }
    }

    /**
     * Convert Firestore document to ChatMessage entity
     */
    private convertFromFirestore(id: string, doc: ChatMessageDoc): ChatMessage {
        return {
            id,
            conversationId: doc.conversationId,
            sender: doc.role,
            content: doc.content,
            timestamp: doc.timestamp.toDate(),
        };
    }
}
