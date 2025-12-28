/**
 * Checkout step order (lower = earlier)
 */
const STEP_ORDER: Record<string, number> = {
    "pending": 1,
    "pending_info": 1,
    "pending_payment": 2,
    "pending_confirm": 3,
    "waiting_supplier": 4,
};

/**
 * Get the correct checkout step path based on booking status
 */
export function getCheckoutPath(status: string): string {
    switch (status) {
        case "pending":
        case "pending_info":
            return "/checkout";
        case "pending_payment":
            return "/checkout/payment";
        case "pending_confirm":
            return "/checkout/confirm";
        case "waiting_supplier":
            return "/checkout/complete";
        default:
            return "/checkout";
    }
}

/**
 * Check if user can access a step based on booking status
 * User can go back to previous steps, but cannot skip forward
 */
export function canAccessStep(status: string, step: "info" | "payment" | "confirm" | "waiting_supplier"): boolean {
    const stepRequirements: Record<string, number> = {
        info: 1,      // Can access if step >= 1 
        payment: 2,   // Can access if step >= 2
        confirm: 3,   // Can access if step >= 3
        waiting_supplier: 4,  // Can access only if confirmed
    };

    const currentStepOrder = STEP_ORDER[status] ?? 1;
    const requiredOrder = stepRequirements[step];

    // If confirmed, ONLY allow complete page
    if (status === "confirmed") {
        return step === "waiting_supplier";
    }

    // For other pages: allow if current progress >= required step
    // This allows going back to previous steps BEFORE confirmation
    return currentStepOrder >= requiredOrder;
}

/**
 * Check if user should be redirected to a different step
 * Returns redirect path if needed, null if current step is valid
 */
export function getRedirectIfNeeded(status: string, currentStep: "info" | "payment" | "confirm" | "waiting_supplier"): string | null {
    // If can access current step, no redirect needed
    if (canAccessStep(status, currentStep)) {
        return null;
    }

    // Cannot access: redirect to the step matching current status
    return getCheckoutPath(status);
}
