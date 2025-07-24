# Requirements Document

## Introduction

This feature enhances the existing purchase recommendation system by adding AI-driven classification of purchase types and dynamic prompt tailoring. Currently, the system uses the same "concise financial-advisor" prompt for all items, leading to inappropriate advice (e.g., discussing "growth" for everyday items like Purell wipes). The enhancement will classify purchases into three categories and provide contextually appropriate advice for each type.

## Requirements

### Requirement 1

**User Story:** As a user seeking purchase advice, I want the system to recognize different types of purchases so that I receive contextually appropriate recommendations rather than generic financial advice for everyday items.

#### Acceptance Criteria

1. WHEN a user requests purchase advice THEN the system SHALL classify the item into one of three categories: ESSENTIAL_DAILY, DISCRETIONARY_SMALL, or HIGH_VALUE
2. WHEN the item is classified as ESSENTIAL_DAILY THEN the system SHALL provide quick, practical advice in two sentences or less
3. WHEN the item is classified as DISCRETIONARY_SMALL THEN the system SHALL provide short cost-benefit analysis with light behavioral nudges
4. WHEN the item is classified as HIGH_VALUE THEN the system SHALL provide the full analytical treatment with detailed financial reasoning

### Requirement 2

**User Story:** As a user, I want the classification to be accurate and consistent so that I can trust the system to provide appropriate advice for different purchase types.

#### Acceptance Criteria

1. WHEN an item costs less than $50 and is a basic necessity (sanitizer, paper towels, toothpaste) THEN the system SHALL classify it as ESSENTIAL_DAILY
2. WHEN an item costs less than $50 and is not a basic necessity (coffee maker, phone case, gadgets) THEN the system SHALL classify it as DISCRETIONARY_SMALL  
3. WHEN an item costs more than $300 regardless of type THEN the system SHALL classify it as HIGH_VALUE
4. WHEN the AI classification fails or returns invalid data THEN the system SHALL default to DISCRETIONARY_SMALL classification
5. WHEN the same item and cost combination is requested multiple times in a session THEN the system SHALL use cached classification results to avoid redundant API calls

### Requirement 3

**User Story:** As a system maintainer, I want the classification logic to be modular and testable so that I can verify its accuracy and maintain it effectively.

#### Acceptance Criteria

1. WHEN the classification function is called with test data THEN it SHALL return predictable results for known item types
2. WHEN unit tests are run THEN they SHALL verify that "Purell disinfecting wipes" at $7 returns ESSENTIAL_DAILY
3. WHEN unit tests are run THEN they SHALL verify that "AmazonBasics phone case" at $15 returns DISCRETIONARY_SMALL
4. WHEN unit tests are run THEN they SHALL verify that "MacBook Air M3" at $1299 returns HIGH_VALUE
5. WHEN the classification module is imported THEN it SHALL not affect existing functionality or exports

### Requirement 4

**User Story:** As a user, I want the system to maintain all existing functionality while providing improved advice so that I don't lose any current capabilities.

#### Acceptance Criteria

1. WHEN the enhanced system processes a purchase request THEN it SHALL return all existing output fields (decision, summary, reasoning, quote, analysisDetails, decisionMatrix)
2. WHEN the AI classification service is unavailable THEN the system SHALL gracefully degrade to existing behavior without errors
3. WHEN existing API endpoints are called THEN they SHALL continue to work with the same signatures and response formats
4. WHEN the system encounters network or parsing errors during classification THEN it SHALL log the error and continue with default classification