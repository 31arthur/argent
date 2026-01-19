import * as admin from 'firebase-admin';
import type { AgentConversation } from '../../domain/entities/AgentConversation';
import type { AgentState } from '../../domain/entities/AgentState';
import type { IAgentConversationRepository } from '../../domain/repositories/IAgentConversationRepository';

/**
 * Agent Conversation Repository Implementation
 * Implements IAgentConversationRepository using Firebase Admin SDK
 * Designed for Cloud Functions deployment
 */
export class AgentConversationRepository implements IAgentConversationRepository {
    private readonly collectionName = 'agentConversations';

    constructor(private firestore: admin.firestore.Firestore) { }

    async getById(id: string): Promise<AgentConversation | null> {
        const doc = await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .get();

        if (!doc.exists) {
            return null;
        }

        return this.mapToConversation(doc);
    }

    async getActiveByUser(userId: string): Promise<AgentConversation | null> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('agentState', 'not-in', ['COMPLETED', 'CANCELLED'])
            .orderBy('lastActivityAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        return this.mapToConversation(snapshot.docs[0]);
    }

    async getAllByUser(userId: string): Promise<AgentConversation[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .orderBy('lastActivityAt', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToConversation(doc));
    }

    async create(
        conversation: Omit<AgentConversation, 'id' | 'startedAt' | 'lastActivityAt'>
    ): Promise<AgentConversation> {
        const now = admin.firestore.Timestamp.now();
        const docData = {
            userId: conversation.userId,
            agentState: conversation.agentState,
            activeDraftId: conversation.activeDraftId || null,
            completedAt: conversation.completedAt
                ? admin.firestore.Timestamp.fromDate(conversation.completedAt)
                : null,
            startedAt: now,
            lastActivityAt: now,
        };

        const docRef = await this.firestore
            .collection(this.collectionName)
            .add(docData);

        return {
            id: docRef.id,
            userId: docData.userId,
            agentState: docData.agentState,
            activeDraftId: docData.activeDraftId || undefined,
            completedAt: docData.completedAt?.toDate(),
            startedAt: now.toDate(),
            lastActivityAt: now.toDate(),
            isDeleted: false,
        };
    }

    async update(id: string, updates: Partial<AgentConversation>): Promise<AgentConversation> {
        const updateData: any = {
            lastActivityAt: admin.firestore.Timestamp.now(),
        };

        if (updates.agentState !== undefined) updateData.agentState = updates.agentState;
        if (updates.activeDraftId !== undefined) updateData.activeDraftId = updates.activeDraftId || null;
        if (updates.completedAt !== undefined) {
            updateData.completedAt = updates.completedAt
                ? admin.firestore.Timestamp.fromDate(updates.completedAt)
                : null;
        }

        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update(updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Conversation with id ${id} not found after update`);
        }

        return updated;
    }

    async updateAgentState(id: string, state: AgentState): Promise<void> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({
                agentState: state,
                lastActivityAt: admin.firestore.Timestamp.now(),
            });
    }

    async updateState(id: string, newState: AgentState): Promise<AgentConversation> {
        await this.updateAgentState(id, newState);
        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Conversation with id ${id} not found after update`);
        }
        return updated;
    }

    async updateActivity(id: string): Promise<AgentConversation> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({
                lastActivityAt: admin.firestore.Timestamp.now(),
            });

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Conversation with id ${id} not found after update`);
        }
        return updated;
    }

    async updateActiveDraftId(id: string, draftId: string): Promise<AgentConversation> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({
                activeDraftId: draftId,
                lastActivityAt: admin.firestore.Timestamp.now(),
            });

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Conversation with id ${id} not found after update`);
        }
        return updated;
    }

    async markAsCompleted(id: string): Promise<AgentConversation> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({
                agentState: 'COMPLETED',
                completedAt: admin.firestore.Timestamp.now(),
                lastActivityAt: admin.firestore.Timestamp.now(),
            });

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Conversation with id ${id} not found after update`);
        }
        return updated;
    }

    async markAsCancelled(id: string): Promise<AgentConversation> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({
                agentState: 'CANCELLED',
                completedAt: admin.firestore.Timestamp.now(),
                lastActivityAt: admin.firestore.Timestamp.now(),
            });

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Conversation with id ${id} not found after update`);
        }
        return updated;
    }

    async softDelete(id: string): Promise<void> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({
                isDeleted: true,
                deletedAt: admin.firestore.Timestamp.now(),
            });
    }

    private mapToConversation(doc: admin.firestore.DocumentSnapshot): AgentConversation {
        const data = doc.data()!;
        return {
            id: doc.id,
            userId: data.userId,
            agentState: data.agentState,
            activeDraftId: data.activeDraftId || undefined,
            completedAt: data.completedAt?.toDate(),
            startedAt: data.startedAt?.toDate() || new Date(),
            lastActivityAt: data.lastActivityAt?.toDate() || new Date(),
            isDeleted: data.isDeleted || false,
            deletedAt: data.deletedAt?.toDate(),
        };
    }
}
