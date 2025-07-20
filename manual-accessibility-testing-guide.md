# Manual Accessibility Testing Guide

This guide provides step-by-step instructions for manually testing the accessibility features of the purple-themed chatbot interface.

## 1. Keyboard Navigation Testing

### Test Focus States
1. **Open the application** in your browser
2. **Press Tab** to navigate through interactive elements
3. **Verify the following focus indicators:**
   - Message input textarea: Should show purple focus ring (indigo-600)
   - Send button: Should show purple focus ring with offset
   - Error close button (if error present): Should show hover opacity change
   - Retry button (if error present): Should show hover underline

### Test Tab Order
1. **Start from the message input** (first focusable element)
2. **Press Tab** and verify the order:
   - Message Input Textarea → Send Button → Error buttons (if present)
3. **Verify** that tab order is logical and doesn't skip elements

### Test Keyboard Shortcuts
1. **Type a message** in the input field
2. **Press Enter** - Message should send
3. **Type a message** and **press Shift+Enter** - Should create new line
4. **Verify** both shortcuts work with new purple styling

## 2. Screen Reader Testing

### Test with Screen Reader (NVDA, JAWS, or VoiceOver)
1. **Turn on your screen reader**
2. **Navigate to the chat interface**
3. **Verify the following announcements:**
   - Message input is announced as "Type your message"
   - User messages are announced as "Your message" with content
   - AI messages are announced as "AI response" with content
   - Loading states are announced when they appear
   - Error messages are announced when they appear
   - Timestamps are announced with proper context

### Test Message Navigation
1. **Navigate through the message list** using screen reader commands
2. **Verify** that each message is properly identified as user or AI
3. **Check** that timestamps are announced with context

## 3. Visual Design Functionality Testing

### Test Message Sending
1. **Type a test message** in the input field
2. **Click the Send button** (should be purple/indigo-600)
3. **Verify:**
   - Button shows hover state (darker purple)
   - Message sends successfully
   - User message appears with purple background
   - Send button shows loading state if applicable

### Test Message Display
1. **Send several messages** to create a conversation
2. **Verify visual styling:**
   - User messages: Purple background (indigo-600), white text, right-aligned
   - AI messages: Light gray background (slate-100), dark text, left-aligned
   - Timestamps: Proper contrast and secondary styling
   - Message bubbles: Rounded corners and shadows

### Test Error Handling
1. **Trigger an error** (disconnect internet or use invalid API key)
2. **Verify error display:**
   - Error appears with purple accent colors
   - Retry button works and has proper styling
   - Close button works and has hover state
   - Error is announced to screen readers

### Test Loading States
1. **Send a message** to trigger loading state
2. **Verify loading indicator:**
   - Shows purple color scheme (indigo background)
   - Spinner animation works
   - "AI is thinking..." text is visible
   - Loading state is announced to screen readers

## 4. Responsive Design Testing

### Test Different Screen Sizes
1. **Resize browser window** to different widths:
   - Mobile (320px - 768px)
   - Tablet (768px - 1024px)
   - Desktop (1024px+)

2. **Verify at each size:**
   - Card layout remains centered and properly sized
   - Purple gradient header scales correctly
   - Message bubbles maintain proper spacing
   - Input field and button remain usable
   - Text remains readable

### Test Mobile-Specific Features
1. **Use browser dev tools** to simulate mobile device
2. **Test touch interactions:**
   - Tap to focus input field
   - Tap send button
   - Scroll through messages
   - Verify all interactions work smoothly

## 5. Cross-Browser Testing

### Test in Multiple Browsers
Test the following in each browser:
- Chrome
- Firefox
- Safari (if on Mac)
- Edge

### Verify Consistency
1. **Purple gradient header** renders correctly
2. **Focus states** work consistently
3. **Color contrast** appears the same
4. **Interactive elements** function properly
5. **Responsive behavior** is consistent

## 6. Color Contrast Verification

### Visual Inspection
1. **Check text readability** in different lighting conditions
2. **Verify contrast** for:
   - White text on purple backgrounds (user messages, header, buttons)
   - Dark text on light backgrounds (AI messages)
   - Secondary text (timestamps)
   - Error and loading text

### Use Browser Tools
1. **Open browser dev tools**
2. **Use accessibility inspector** to check contrast ratios
3. **Verify** all ratios meet WCAG AA standards (4.5:1 for normal text)

## Expected Results

### ✅ Pass Criteria
- All focus states show purple theme consistently
- Tab order is logical and complete
- Screen reader announces all content appropriately
- All functionality works with new visual design
- Interface is responsive across screen sizes
- Color contrast meets WCAG AA standards
- Cross-browser compatibility is maintained

### ❌ Fail Criteria
- Focus states are missing or inconsistent
- Tab order skips elements or is illogical
- Screen reader cannot access or announce content
- Functionality is broken with new styling
- Interface breaks on certain screen sizes
- Color contrast is insufficient
- Significant differences between browsers

## Reporting Issues

If you find any accessibility issues during testing:

1. **Document the issue** with:
   - Browser and version
   - Screen size (if relevant)
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshot (if visual issue)

2. **Classify severity:**
   - Critical: Prevents core functionality
   - High: Accessibility barrier for users with disabilities
   - Medium: Usability issue
   - Low: Minor enhancement

3. **Suggest solutions** if possible

## Testing Checklist

- [ ] Keyboard navigation works with purple focus states
- [ ] Tab order is logical and complete
- [ ] Keyboard shortcuts (Enter, Shift+Enter) function
- [ ] Screen reader announces all content appropriately
- [ ] Message sending works with purple button styling
- [ ] Messages display with correct purple/gray color scheme
- [ ] Error handling works with purple-themed display
- [ ] Loading states show purple color scheme
- [ ] Interface is responsive on mobile, tablet, desktop
- [ ] Cross-browser compatibility maintained
- [ ] Color contrast meets WCAG standards
- [ ] All existing functionality preserved

---

**Note:** This manual testing should be performed by someone familiar with accessibility testing and screen reader usage for the most accurate results.