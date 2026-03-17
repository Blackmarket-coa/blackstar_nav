import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { YStack } from 'tamagui';
import { underscore } from 'inflected';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import useCurrentLocation from '../hooks/use-current-location';
import useFleetbase from '../hooks/use-fleetbase';
import IssueForm from '../components/IssueForm';
import useStorage from '../hooks/use-storage';
const { createCanonicalReceiptPayload, createTamperEvidentReceipt } = require('../receipts/tamper-evident-receipts.cjs');

const CreateIssueScreen = () => {
    const navigation = useNavigation();
    const { driver } = useAuth();
    const { runtimeConfig } = useConfig();
    const { adapter } = useFleetbase();
    const { liveLocation } = useCurrentLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [tamperEvidentReceipts, setTamperEvidentReceipts] = useStorage('tamper_evident_receipts', []);

    const handleCreateIssue = useCallback(
        async (issue) => {
            setIsLoading(true);

            try {
                const payload = createCanonicalReceiptPayload({
                    eventType: 'dispute.created',
                    recordType: 'dispute',
                    orderId: issue.order,
                    actorId: driver.id,
                    details: {
                        issue_type: underscore(issue.type),
                        issue_priority: underscore(issue.priority),
                        issue_status: underscore(issue.status),
                    },
                });
                const receipt = createTamperEvidentReceipt({ payload, secret: runtimeConfig.BLACKSTAR_GATEWAY_KEY });

                await adapter.post('issues', {
                    ...issue,
                    driver: driver.id,
                    location: liveLocation ? liveLocation.getAttribute('location') : null,
                    type: underscore(issue.type),
                    priority: underscore(issue.priority),
                    status: underscore(issue.status),
                    receipt_metadata: receipt,
                });

                setTamperEvidentReceipts([...(tamperEvidentReceipts || []), receipt]);
                navigation.goBack();
            } catch (err) {
                console.warn('Error creating new issue:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [adapter, liveLocation, navigation, driver, runtimeConfig, tamperEvidentReceipts]
    );

    return (
        <YStack flex={1} bg='$background'>
            <IssueForm onSubmit={handleCreateIssue} isSubmitting={isLoading} />
        </YStack>
    );
};

export default CreateIssueScreen;
