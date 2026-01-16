#!/bin/bash
#
# Deployment Script for Medical Spa Cloud Functions
# Deploys event-driven notifications and scheduled reminder functions
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default values
ENVIRONMENT="${ENVIRONMENT:-development}"
REGION="${REGION:-us-central1}"
PROJECT_ID="${PROJECT_ID:-}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project)
            PROJECT_ID="$2"
            shift 2
            ;;
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --region)
            REGION="$2"
            shift 2
            ;;
        --only)
            ONLY_FUNCTIONS="$2"
            shift 2
            ;;
        --help)
            echo "Usage: ./deploy.sh [options]"
            echo ""
            echo "Options:"
            echo "  --project PROJECT_ID   Firebase/GCP project ID"
            echo "  --env ENVIRONMENT      Environment (development|staging|production)"
            echo "  --region REGION        Cloud Functions region (default: us-central1)"
            echo "  --only FUNCTIONS       Comma-separated list of functions to deploy"
            echo "  --help                 Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./deploy.sh --project medspa-dev --env development"
            echo "  ./deploy.sh --project medspa-prod --env production"
            echo "  ./deploy.sh --only onAppointmentCreated,onMessageCreated"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate project ID
if [ -z "$PROJECT_ID" ]; then
    log_info "No project specified, using default from firebase config..."
fi

# Print deployment info
echo ""
echo "=============================================="
echo "  Medical Spa Cloud Functions Deployment"
echo "=============================================="
echo "  Environment: $ENVIRONMENT"
echo "  Region:      $REGION"
echo "  Project:     ${PROJECT_ID:-<default>}"
if [ -n "$ONLY_FUNCTIONS" ]; then
    echo "  Functions:   $ONLY_FUNCTIONS"
fi
echo "=============================================="
echo ""

# Step 1: Check prerequisites
log_info "Checking prerequisites..."

if ! command -v firebase &> /dev/null; then
    log_error "Firebase CLI is not installed. Install it with: npm install -g firebase-tools"
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    log_warning "gcloud CLI is not installed. Some features may not work."
fi

log_success "Prerequisites check passed"

# Step 2: Install dependencies
log_info "Installing dependencies..."
npm ci
log_success "Dependencies installed"

# Step 3: Build TypeScript
log_info "Building TypeScript..."
npm run build
log_success "TypeScript build completed"

# Step 4: Run linting (optional, continue on error)
log_info "Running linter..."
npm run lint || log_warning "Linting had warnings/errors"

# Step 5: Set up Cloud Tasks queue (if gcloud is available)
if command -v gcloud &> /dev/null && [ -n "$PROJECT_ID" ]; then
    log_info "Setting up Cloud Tasks queue..."

    # Check if queue exists
    if ! gcloud tasks queues describe appointment-reminders --project="$PROJECT_ID" --location="$REGION" &> /dev/null; then
        log_info "Creating Cloud Tasks queue: appointment-reminders"
        gcloud tasks queues create appointment-reminders \
            --project="$PROJECT_ID" \
            --location="$REGION" \
            --max-dispatches-per-second=10 \
            --max-concurrent-dispatches=100 \
            --max-attempts=5 \
            --min-backoff=10s \
            --max-backoff=300s || log_warning "Failed to create queue (may already exist)"
    else
        log_info "Cloud Tasks queue already exists"
    fi
fi

# Step 6: Deploy functions
log_info "Deploying Cloud Functions..."

DEPLOY_CMD="firebase deploy --only functions"

if [ -n "$PROJECT_ID" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --project $PROJECT_ID"
fi

if [ -n "$ONLY_FUNCTIONS" ]; then
    # Format function names for Firebase deploy
    FUNCTION_LIST=""
    IFS=',' read -ra FUNCS <<< "$ONLY_FUNCTIONS"
    for func in "${FUNCS[@]}"; do
        if [ -n "$FUNCTION_LIST" ]; then
            FUNCTION_LIST="$FUNCTION_LIST,functions:$func"
        else
            FUNCTION_LIST="functions:$func"
        fi
    done
    DEPLOY_CMD="firebase deploy --only $FUNCTION_LIST"
    if [ -n "$PROJECT_ID" ]; then
        DEPLOY_CMD="$DEPLOY_CMD --project $PROJECT_ID"
    fi
fi

echo ""
log_info "Running: $DEPLOY_CMD"
echo ""

eval $DEPLOY_CMD

# Step 7: Verify deployment
log_success "Deployment completed!"

echo ""
echo "=============================================="
echo "  Deployment Summary"
echo "=============================================="
echo ""
echo "Deployed Functions:"
echo "  - onAppointmentCreated    (Firestore trigger)"
echo "  - onAppointmentUpdated    (Firestore trigger)"
echo "  - onMessageCreated        (Firestore trigger)"
echo "  - onWaitingRoomReady      (Firestore trigger)"
echo "  - onCheckInAvailable      (Firestore trigger)"
echo "  - sendScheduledReminder   (HTTP - Cloud Tasks target)"
echo "  - triggerManualReminder   (HTTP - Admin endpoint)"
echo ""
echo "Cloud Tasks Queue:"
echo "  - appointment-reminders"
echo ""
echo "Next Steps:"
echo "  1. Test the functions using the Firebase Emulator Suite"
echo "  2. Monitor logs: firebase functions:log"
echo "  3. Set up alerts in Google Cloud Console"
echo ""
log_info "View logs: firebase functions:log --project $PROJECT_ID"
echo ""
