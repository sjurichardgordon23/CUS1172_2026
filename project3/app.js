
const API_URL = 'https://my-json-server.typicode.com/sjurichardgordon23/CUS1172_2026';

// ========== MODEL ==========
class Model {
    constructor() {
        this.state = {
            userName: '',
            burgerId: '',
            burgerTitle: '',
            currentStepIndex: 0,
            selectedItems: [],
            steps: [],
            waitingForFeedback: false,
            pendingSelection: null,
            pendingStep: null,
            confirmationMessage: ''
        };
    }

    async fetchBurgers() {

        return [
            {
                "id": "classic-beef",
                "title": "Classic Beef Burger",
                "steps": [
                    {
                        "id": "bun",
                        "type": "multiple-choice",
                        "instruction": "Choose your bun",
                        "options": ["Sesame", "Brioche", "Lettuce Wrap"],
                        "feedback": null
                    },
                    {
                        "id": "protein",
                        "type": "multiple-choice",
                        "instruction": "Choose your protein",
                        "options": ["Beef Patty", "Double Beef", "Plant-Based"],
                        "feedback": null
                    },
                    {
                        "id": "toppings",
                        "type": "multiple-choice",
                        "instruction": "Select your toppings",
                        "options": ["Lettuce & Tomato", "Pickles & Onions", "All Veggies", "No Toppings"],
                        "feedback": {
                            "condition": "toppings === 'No Toppings'",
                            "message": "Burgers taste better with fresh veggies! Want to add some?"
                        }
                    },
                    {
                        "id": "sauce",
                        "type": "text",
                        "instruction": "How many sauce servings? (1-5)",
                        "feedback": {
                            "condition": "sauce > 3",
                            "message": "Too much sauce might overpower the flavor!"
                        }
                    },
                    {
                        "id": "presentation",
                        "type": "image-selection",
                        "instruction": "Choose your burger presentation",
                        "imageOptions": [
                            { "value": "Classic Wrap", "label": "Classic Paper Wrap" },
                            { "value": "Fancy Box", "label": "Premium Box" },
                            { "value": "Open Tray", "label": "Dine-in Tray" }
                        ],
                        "feedback": {
                            "condition": "presentation === 'Fancy Box'",
                            "message": "Fancy box costs extra $2. Still want it?"
                        }
                    }
                ]
            },
            {
                "id": "grilled-chicken",
                "title": "Grilled Chicken Burger",
                "steps": [
                    {
                        "id": "bun",
                        "type": "multiple-choice",
                        "instruction": "Choose your bun",
                        "options": ["Whole Wheat", "Brioche", "Lettuce Wrap"],
                        "feedback": null
                    },
                    {
                        "id": "protein",
                        "type": "multiple-choice",
                        "instruction": "Choose your chicken style",
                        "options": ["Grilled Chicken", "Crispy Chicken", "Double Chicken"],
                        "feedback": null
                    },
                    {
                        "id": "toppings",
                        "type": "multiple-choice",
                        "instruction": "Select your toppings",
                        "options": ["Avocado & Spinach", "Roasted Peppers", "Classic Veggies", "No Toppings"],
                        "feedback": {
                            "condition": "toppings === 'No Toppings'",
                            "message": "Toppings add great flavor and nutrition!"
                        }
                    },
                    {
                        "id": "sauce",
                        "type": "text",
                        "instruction": "How many sauce servings? (1-5)",
                        "feedback": {
                            "condition": "sauce < 1",
                            "message": "Minimum 1 sauce serving required!"
                        }
                    },
                    {
                        "id": "presentation",
                        "type": "image-selection",
                        "instruction": "Choose your burger presentation",
                        "imageOptions": [
                            { "value": "Classic Wrap", "label": "Classic Paper Wrap" },
                            { "value": "Fancy Box", "label": "Premium Box" },
                            { "value": "Eco Box", "label": "Eco-Friendly Box" }
                        ],
                        "feedback": null
                    }
                ]
            }
        ];
    }

    async fetchBurgerSteps(burgerId) {
        const burgers = await this.fetchBurgers();
        const burger = burgers.find(b => b.id === burgerId);
        return burger ? burger.steps : [];
    }

    setUserName(name) {
        this.state.userName = name;
    }

    async setBurger(burgerId, burgerTitle) {
        this.state.burgerId = burgerId;
        this.state.burgerTitle = burgerTitle;
        this.state.steps = await this.fetchBurgerSteps(burgerId);
        this.state.currentStepIndex = 0;
        this.state.selectedItems = [];
        this.state.waitingForFeedback = false;
    }

    addSelection(stepInstruction, value) {
        this.state.selectedItems.push({
            step: stepInstruction,
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

    isComplete() {
        return this.state.currentStepIndex >= this.state.steps.length;
    }

    completedAllSteps() {
        return this.state.selectedItems.length === this.state.steps.length;
    }

    setWaitingForFeedback(selection, step) {
        this.state.waitingForFeedback = true;
        this.state.pendingSelection = selection;
        this.state.pendingStep = step;
    }

    clearFeedback() {
        this.state.waitingForFeedback = false;
        if (this.state.pendingSelection && this.state.pendingStep) {
            this.addSelection(this.state.pendingStep.instruction, this.state.pendingSelection);
            this.state.pendingSelection = null;
            this.state.pendingStep = null;
        }
    }

    showConfirmation(message) {
        this.state.confirmationMessage = message;
        setTimeout(() => {
            this.state.confirmationMessage = '';
            if (this.onUpdate) this.onUpdate();
        }, 1000);
    }

    reset() {
        this.state = {
            userName: '',
            burgerId: '',
            burgerTitle: '',
            currentStepIndex: 0,
            selectedItems: [],
            steps: [],
            waitingForFeedback: false,
            pendingSelection: null,
            pendingStep: null,
            confirmationMessage: ''
        };
    }

    setUpdateCallback(callback) {
        this.onUpdate = callback;
    }

    getState() {
        return this.state;
    }
}


class View {
    constructor() {
        this.templates = {};
        this.compileTemplates();
    }

    compileTemplates() {
        this.templates.welcome = Handlebars.compile(document.getElementById('welcome-template').innerHTML);
        this.templates.burgerSelect = Handlebars.compile(document.getElementById('burger-selection-template').innerHTML);
        this.templates.customization = Handlebars.compile(document.getElementById('customization-template').innerHTML);
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

    renderStep(state, currentStep, showFeedback, feedbackMessage) {
        const templateData = {
            userName: state.userName,
            burgerTitle: state.burgerTitle,
            selectedItems: state.selectedItems,
            currentStep: currentStep,
            isMultipleChoice: currentStep.type === 'multiple-choice',
            isText: currentStep.type === 'text',
            isImageSelection: currentStep.type === 'image-selection',
            confirmationMessage: state.confirmationMessage,
            showFeedback: showFeedback || state.waitingForFeedback,
            feedbackMessage: feedbackMessage
        };
        
        const html = this.templates.customization(templateData);
        document.getElementById('app').innerHTML = html;
    }

    renderFinal(state) {
        const html = this.templates.final({
            userName: state.userName,
            burgerTitle: state.burgerTitle,
            selectedItems: state.selectedItems,
            completedAllSteps: this.completedAllSteps(state)
        });
        document.getElementById('app').innerHTML = html;
    }

    completedAllSteps(state) {
        return state.selectedItems.length === state.steps.length;
    }
}

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
        const nameInput = document.getElementById('nameInput');
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
            this.model.getState().userName,
            burgers,
            this.model.getState().selectedItems
        );
    }

    async selectBurger(burgerId, burgerTitle) {
        await this.model.setBurger(burgerId, burgerTitle);
        this.updateView();
    }

    async makeSelection(value) {
        const currentStep = this.model.getCurrentStep();
        
        if (currentStep.feedback) {
            let shouldShowFeedback = false;
            let feedbackMessage = '';
            
            if (currentStep.feedback.condition.includes('toppings') && value === 'No Toppings') {
                shouldShowFeedback = true;
                feedbackMessage = currentStep.feedback.message;
            }
            
            if (shouldShowFeedback) {
                this.model.setWaitingForFeedback(value, currentStep);
                this.updateView(true, feedbackMessage);
                return;
            }
        }
        
        this.model.addSelection(currentStep.instruction, value);
        this.model.showConfirmation('Great choice!');
        
        if (this.model.isComplete()) {
            this.updateView();
        }
    }

    async submitText() {
        const textInput = document.getElementById('textInput');
        let value = textInput.value;
        const currentStep = this.model.getCurrentStep();
        
        if (!value || value < 1 || value > 5) {
            alert('Please enter a number between 1 and 5!');
            return;
        }
        
        value = `${value} serving(s)`;
        
        if (currentStep.feedback && currentStep.feedback.condition.includes('sauce > 3') && parseInt(textInput.value) > 3) {
            this.model.setWaitingForFeedback(value, currentStep);
            this.updateView(true, currentStep.feedback.message);
            return;
        }
        
        if (currentStep.feedback && currentStep.feedback.condition.includes('sauce < 1') && parseInt(textInput.value) < 1) {
            this.model.setWaitingForFeedback(value, currentStep);
            this.updateView(true, currentStep.feedback.message);
            return;
        }
        
        this.model.addSelection(currentStep.instruction, value);
        this.model.showConfirmation('Extra tasty!');
        
        if (this.model.isComplete()) {
            this.updateView();
        }
    }

    async selectImage(value, label) {
        const currentStep = this.model.getCurrentStep();
        
        if (currentStep.feedback && currentStep.feedback.condition.includes('presentation') && value === 'Fancy Box') {
            this.model.setWaitingForFeedback(label, currentStep);
            this.updateView(true, currentStep.feedback.message);
            return;
        }
        
        this.model.addSelection(currentStep.instruction, label);
        this.model.showConfirmation('Nice pick!');
        
        if (this.model.isComplete()) {
            this.updateView();
        }
    }

    dismissFeedback() {
        this.model.clearFeedback();
        this.model.showConfirmation('Got it! Moving on...');
        this.updateView();
    }

    updateView(showFeedback = false, feedbackMessage = '') {
        const state = this.model.getState();
        
        if (!state.burgerId) {
            return;
        }
        
        if (this.model.isComplete()) {
            this.view.renderFinal(state);
            return;
        }
        
        const currentStep = this.model.getCurrentStep();
        if (currentStep) {
            this.view.renderStep(state, currentStep, showFeedback, feedbackMessage);
        }
    }

    restartOrder() {
        this.model.reset();
        this.init();
    }

    returnHome() {
        this.model.reset();
        this.init();
    }
}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);
