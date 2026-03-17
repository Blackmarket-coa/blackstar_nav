import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { YStack } from 'tamagui';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useTempStore } from '../contexts/TempStoreContext';
import { later } from '../utils';
import useFleetbase from '../hooks/use-fleetbase';
import IssueForm from '../components/IssueForm';
import useStorage from '../hooks/use-storage';
const { createCanonicalReceiptPayload, createTamperEvidentReceipt } = require('../receipts/tamper-evident-receipts.cjs');

const EditIssueScreen = () => {
    const navigation = useNavigation();
    const {
        setValue,
        store: { issue },
    } = useTempStore();
    const { driver } = useAuth();
    const { runtimeConfig } = useConfig();
    const { adapter } = useFleetbase();
    const [isLoading, setIsLoading] = useState(false);
    const [tamperEvidentReceipts, setTamperEvidentReceipts] = useStorage('tamper_evident_receipts', []);

    const handleSaveIssue = useCallback(
        async (issueData) => {
            setIsLoading(true);

            try {
                const payload = createCanonicalReceiptPayload({
                    eventType: 'dispute.updated',
                    recordType: 'dispute',
                    orderId: issueData.order,
                    issueId: issue.id,
                    actorId: driver.id,
                    details: {
                        issue_type: issueData.type,
                        issue_priority: issueData.priority,
                        issue_status: issueData.status,
                    },
                });
                const receipt = createTamperEvidentReceipt({ payload, secret: runtimeConfig.BLACKSTAR_GATEWAY_KEY });

                const updatedIssue = await adapter.put(`issues/${issue.id}`, {
                    ...issueData,
                    driver: driver.id,
                    receipt_metadata: receipt,
                });
                setTamperEvidentReceipts([...(tamperEvidentReceipts || []), receipt]);
                setValue('issue', updatedIssue);
                later(() => navigation.goBack(), 300);
            } catch (err) {
                console.warn('Error updating issue:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [adapter, driver, navigation, setValue, runtimeConfig, tamperEvidentReceipts]
    );

    return (
        <YStack flex={1} bg='$background'>
            <IssueForm value={issue} onSubmit={handleSaveIssue} isSubmitting={isLoading} submitText='Save Issue' />
        </YStack>
    );
};

export default EditIssueScreen;
