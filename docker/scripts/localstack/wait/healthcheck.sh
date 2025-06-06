#!/usr/bin/env bash

# SQS
queues=$(awslocal sqs list-queues)
echo $queues | grep "audit-queue" || exit 1
