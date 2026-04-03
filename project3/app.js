// ========== MODEL ==========
class Model {
    constructor() {
        this.apiUrl = 'https://my-json-server.typicode.com/sjurichardgordon23/CUS1172_2026';
        this.state = {
            userName: null,
            selectedBurger: null,
            burgerTitle: null,
            currentStepIndex: 0,
            selections: [],
            steps: [],
            waitingForFeedback: false,
            pendingSelection: null,
            confirmationMessage: null
        };
    }

    async fetchBurgers() {
        const response = await fetch(`${this.apiUrl}/burgers`);
        return await response.json();
    }

    async fetchBurgerSteps(burgerId) {
        const burgers = await this.fetchBurgers();
        const burger = burgers.find(b => b.id === burgerId);
        return burger ? burger.steps : [];
    }

    setUserName(name) {
        this.state.userName = name;
    }

    setBurger(burgerId, burgerTitle, steps) {
        this.state.selectedBurger = burgerId;
        this.state.burgerTitle = burgerTitle;
        this.state.steps = steps;
        this.state.currentStepIndex = 0;
        this.state.selections = [];
    }

    addSelection(stepId, instruction, value) {
        this.state.selections.push({
            step: instruction,
            value: value
        });
        this.state.currentStepIndex++;
    }

    getCurrentStep() {
        if (this.state.currentStepIndex < this.state.steps.length) {
            return this.state.steps[this.state.currentStepIndex];
        }
        return null;
    }

    getStepIndex() {
        return this.state.currentStepIndex;
    }

    getTotalSteps() {
        return this.state.steps.length;
    }

    setWaitingForFeedback(selection, step) {
        this.state.waitingForFeedback = true;
        this.state.pendingSelection = { selection, step };
    }

    clearFeedback() {
        this.state.waitingForFeedback = false;
        const pending = this.state.pendingSelection;
        if (pending) {
            this.addSelection(pending.step.id, pending.step.instruction, pending.selection);
            this.state.pendingSelection = null;
        }
    }

    showConfirmation(message) {
        this.state.confirmationMessage = message;
        setTimeout(() => {
            this.state.confirmationMessage = null;
            if (this.onUpdate) this.onUpdate();
        }, 1000);
    }

    isComplete() {
        return this.state.currentStepIndex >= this.state.steps.length;
    }

    completedAllSteps() {
        return this.state.selections.length === this.state.steps.length;
    }

    reset() {
        this.state = {
            userName: null,
            selectedBurger: null,
            burgerTitle: null,
            currentStepIndex: 0,
            selections: [],
            steps: [],
            waitingForFeedback: false,
            pendingSelection: null,
            confirmationMessage: null
        };
    }

    setUpdateCallback(callback) {
        this.onUpdate = callback;
    }

    getState() {
        return this.state;
    }
}

// ========== VIEW ==========
class View {
    constructor() {
        this.templates = {};
        this.compileTemplates();
    }

    compileTemplates() {
        this.templates.welcome = Handlebars.compile(document.getElementById('welcome-template').innerHTML);
        this.templates.burgerSelect = Handlebars.compile(document.getElementById('burger-selection-template').innerHTML);
        this.templates.step = Handlebars.compile(document.getElementById('step-template').innerHTML);
        this.templates.final = Handlebars.compile(document.getElementById('final-template').innerHTML);
    }

    renderWelcome() {
        document.getElementById('app').innerHTML = this.templates.welcome({});
    }

    renderBurgerSelection(userName, burgers, selections) {
        const html = this.templates.burgerSelect({
            userName: userName,
            burgers: burgers,
            selections: selections
        });
        document.getElementById('app').innerHTML = html;
    }

    renderStep(state, step, confirmationMessage, showFeedback, feedbackMessage) {
        const templateData = {
            userName: state.userName,
            burgerTitle: state.burgerTitle,
            selections: state.selections,
            instruction: step.instruction,
            isMultipleChoice: step.type === 'multiple-choice',
            isTextInput: step.type === 'text',
            isImageSelection: step.type === 'image-selection',
            options: step.options,
            imageOptions: step.imageOptions,
            confirmationMessage: confirmationMessage,
            showFeedback: showFeedback,
            feedbackMessage: feedbackMessage
        };
        document.getElementById('app').innerHTML = this.templates.step(templateData);
    }

    renderFinal(state) {
        const html = this.templates.final({
            userName: state.userName,
            burgerTitle: state.burgerTitle,
            selections: state.selections,
            completedAllSteps: state.selections.length === state.steps.length
        });
        document.getElementById('app').innerHTML = html;
    }
}

// ========== CONTROLLER ==========
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.model.setUpdateCallback(() => this.updateView());
        this.init();
    }

    async init() {
        this.view.renderWelcome();
    }

    async submitName() {
        const nameInput = document.getElementById('userName');
        const userName = nameInput.value.trim();
        
        if (!userName) {
            alert('Please enter your name!');
            return;
        }
        
        this.model.setUserName(userName);
        await this.showBurgerSelection();
    }

    async showBurgerSelection() {
        const burgers = await this.model.fetchBurgers();
        this.view.renderBurgerSelection(
            this.model.state.userName,
            burgers,
            this.model.state.selections
        );
    }

    async selectBurger(burgerId, burgerTitle) {
        const steps = await this.model.fetchBurgerSteps(burgerId);
        this.model.setBurger(burgerId, burgerTitle, steps);
        this.updateView();
    }

    async makeSelection(value) {
        const currentStep = this.model.getCurrentStep();
        
        // Check for feedback conditions
        if (currentStep.feedback) {
            const condition = currentStep.feedback.condition;
            let shouldShowFeedback = false;
            
            if (condition.includes('toppings') && value === 'No Toppings') {
                shouldShowFeedback = true;
            } else if (condition.includes('presentation') && value === 'Fancy Box') {
                shouldShowFeedback = true;
            }
            
            if (shouldShowFeedback) {
                this.model.setWaitingForFeedback(value, currentStep);
                this.updateView(true, currentStep.feedback.message);
                return;
            }
        }
        
        // Add selection and show confirmation
        this.model.addSelection(currentStep.id, currentStep.instruction, value);
        this.model.showConfirmation('✅ Great choice!');
        
        // Check if complete
        if (this.model.isComplete()) {
            this.updateView();
        }
    }

    async submitText() {
        const textInput = document.getElementById('textValue');
        let value = textInput.value;
        const currentStep = this.model.getCurrentStep();
        
        // Validate sauce amount
        if (currentStep.id === 'sauce') {
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 1 || numValue > 5) {
                alert('Please enter a number between 1 and 5!');
                return;
            }
            value = `${numValue} servings`;
            
            // Check feedback for sauce
            if (currentStep.feedback && numValue > 3) {
                this.model.setWaitingForFeedback(value, currentStep);
                this.updateView(true, currentStep.feedback.message);
                return;
            }
        }
        
        this.model.addSelection(currentStep.id, currentStep.instruction, value);
        this.model.showConfirmation('✨ Extra tasty!');
        
        if (this.model.isComplete()) {
            this.updateView();
        }
    }

    async selectImage(value, label) {
        const currentStep = this.model.getCurrentStep();
        
        // Check feedback for fancy box
        if (currentStep.feedback && value === 'Fancy Box') {
            this.model.setWaitingForFeedback(label, currentStep);
            this.updateView(true, currentStep.feedback.message);
            return;
        }
        
        this.model.addSelection(currentStep.id, currentStep.instruction, label);
        this.model.showConfirmation('🎨 Nice pick!');
        
        if (this.model.isComplete()) {
            this.updateView();
        }
    }

    dismissFeedback() {
        this.model.clearFeedback();
        this.model.showConfirmation('👍 Got it! Moving on...');
        this.updateView();
    }

    updateView(showFeedback = false, feedbackMessage = '') {
        const state = this.model.getState();
        
        if (!state.selectedBurger) {
            return;
        }
        
        if (this.model.isComplete()) {
            this.view.renderFinal(state);
            return;
        }
        
        const currentStep = this.model.getCurrentStep();
        if (currentStep) {
            this.view.renderStep(
                state,
                currentStep,
                state.confirmationMessage,
                showFeedback || state.waitingForFeedback,
                feedbackMessage || (state.waitingForFeedback ? 'This combination might not be ideal!' : '')
            );
        }
    }

    restart() {
        this.model.reset();
        this.init();
    }

    returnHome() {
        this.model.reset();
        this.init();
    }
}

// Initialize the application
const model = new Model();
const view = new View();
const controller = new Controller(model, view);
