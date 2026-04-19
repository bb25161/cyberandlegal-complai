#!/bin/bash
export VITE_FIREBASE_API_KEY=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_API_KEY)
export VITE_FIREBASE_AUTH_DOMAIN=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_AUTH_DOMAIN)
export VITE_FIREBASE_PROJECT_ID=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_PROJECT_ID)
export VITE_FIREBASE_STORAGE_BUCKET=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_STORAGE_BUCKET)
export VITE_FIREBASE_MESSAGING_SENDER_ID=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_MESSAGING_SENDER_ID)
export VITE_FIREBASE_APP_ID=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_APP_ID)
echo "✓ Secrets loaded from Google Secret Manager"
