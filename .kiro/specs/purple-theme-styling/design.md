# Design Document

## Overview

This design transforms the existing OpenAI Firebase chatbot from a blue-themed interface to a professional purple-themed financial application style. The design maintains all existing functionality while implementing a cohesive visual identity that matches modern financial software interfaces.

## Architecture

### Color System
The design implements a purple-based color palette:
- **Primary Purple**: `#6366f1` (Indigo-500)
- **Secondary Purple**: `#8b5cf6` (Violet-400) 
- **Purple Gradient**: Linear gradient from `#6366f1` to `#8b5cf6`
- **Background**: `#f8fafc` (Slate-50)
- **Card Background**: `#ffffff` (White)
- **Text Primary**: `#1e293b` (Slate-800)
- **Text Secondary**: `#64748b` (Slate-500)

### Layout Structure
The interface follows a card-based layout pattern:
1. **Header**: Purple gradient background with white text
2. **Main Container**: Centered card with shadow on light background
3. **Chat Area**: White background within the card container
4. **Input Area**: Bottom-aligned within the card with purple accents

## Components and Interfaces

### 1. Page Layout (src/app/page.tsx)
**Current State**: Blue header with white background
**New Design**: 
- Purple gradient header background
- Light gray page background (`bg-slate-50`)
- Centered card container with enhanced shadows
- Header text remains white for contrast

### 2. Chat Interface Container (src/components/ChatInterface.tsx)
**Current State**: Gray background with basic styling
**New Design**:
- Remove gray background (handled by page layout)
- Focus on internal component styling
- Maintain flex layout structure

### 3. Message List (src/components/MessageList.tsx)
**Current State**: Blue user messages, gray AI messages
**New Design**:
- User messages: Purple background (`bg-indigo-500`) with white text
- AI messages: Light gray background (`bg-slate-100`) with dark text
- Enhanced message bubble styling with better shadows
- Improved timestamp styling with secondary text colors

### 4. Message Input (src/components/MessageInput.tsx)
**Current State**: Blue button and focus states
**New Design**:
- Purple button background (`bg-indigo-500`) with hover state (`hover:bg-indigo-600`)
- Purple focus ring for textarea (`focus:ring-indigo-500`)
- Enhanced border styling and padding
- Consistent purple theming throughout

### 5. Error Display & Loading Components
**Current State**: Basic styling
**New Design**:
- Purple accent colors for consistency
- Enhanced visual hierarchy
- Maintain accessibility standards

## Data Models

No data model changes required. This is purely a visual/styling update that maintains all existing interfaces and data structures.

## Error Handling

Error handling remains unchanged. Visual styling updates include:
- Purple-themed error states
- Consistent color usage in error messages
- Enhanced visual feedback for error conditions

## Testing Strategy

### Visual Regression Testing
- Screenshot comparisons for key components
- Cross-browser compatibility testing
- Responsive design validation

### Component Testing
- Verify all existing functionality remains intact
- Test color contrast ratios for accessibility
- Validate focus states and keyboard navigation

### Integration Testing
- End-to-end chat functionality with new styling
- Message sending and receiving with visual updates
- Error state handling with new color scheme

## Implementation Approach

### Phase 1: Tailwind Configuration
- Extend Tailwind config with custom purple color palette
- Define consistent spacing and shadow utilities

### Phase 2: Layout Updates
- Update page layout with purple gradient header
- Implement card-based container system
- Update background colors and spacing

### Phase 3: Component Styling
- Update MessageList with purple user message styling
- Update MessageInput with purple button and focus states
- Update supporting components (Error, Loading) with consistent theming

### Phase 4: Polish & Accessibility
- Ensure color contrast compliance
- Test responsive behavior
- Validate keyboard navigation and focus states

## Design Decisions & Rationales

1. **Purple Color Choice**: Matches the financial application aesthetic shown in the reference images while maintaining professional appearance
2. **Card-Based Layout**: Creates visual hierarchy and focuses attention on the chat interface
3. **Gradient Header**: Adds visual interest while maintaining brand consistency
4. **Maintained Functionality**: All existing features remain unchanged to ensure no regression in user experience
5. **Accessibility First**: Color choices maintain WCAG contrast requirements for readability