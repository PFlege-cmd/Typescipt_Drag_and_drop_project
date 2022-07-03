function Autobind(_target: any, _description: string, properties: PropertyDescriptor): PropertyDescriptor{
    
    const methodInvocation = properties.value;
    return {
        enumerable: false,
        configurable: true,
        get(){
            return methodInvocation.bind(this)
            }
        }
    }


class ProjectInput {
    templateElement: HTMLTemplateElement;
    divElement: HTMLDivElement;
    formElement: HTMLFormElement;

    titleFormElement: HTMLInputElement;
    descriptionFormElement: HTMLInputElement;
    peopleFormElement: HTMLInputElement

    constructor(){
        this.templateElement = document.querySelector("#project-input") as HTMLTemplateElement;
        this.divElement = document.querySelector("#app") as HTMLDivElement;

        let importedNodeFromTemplate: DocumentFragment = document.importNode(this.templateElement.content, true)!;
        this.formElement = importedNodeFromTemplate.firstElementChild as HTMLFormElement;
        this.formElement.id = 'user-input';


        this.titleFormElement = this.formElement.querySelector('#title')!;
        this.descriptionFormElement = this.formElement.querySelector('#description')!;
        this.peopleFormElement = this.formElement.querySelector('#people')!;

        this.configure()
        this.attach(this.divElement, this.formElement)
    }

    private attach(elementToAttachTo: HTMLElement, elementToAttach: HTMLElement){
        elementToAttachTo.insertAdjacentElement('afterbegin', elementToAttach);
    }

    private getUserInput(): [string, string, number] | void {
        const title = this.titleFormElement.value;
        const description = this.descriptionFormElement.value;
        const people = this.peopleFormElement.value;

        if (title.length === 0 || description.length === 0 || people.length === 0){
            alert('Invalid input');
            return;
        }

        return [title, description, +people];
    }

    @Autobind
    private submitValue(event: Event){

        event.preventDefault();
        console.log(this.titleFormElement.value);

        const userInputs = this.getUserInput();
        if (Array.isArray(userInputs)){
            console.log(userInputs)
            this.resetUserInputs();
        }   
    }

    private resetUserInputs(){
        this.titleFormElement.value = '';
        this.descriptionFormElement.value = '';
        this.peopleFormElement.value = '';
    }

    private configure(){
        this.formElement.addEventListener('submit', this.submitValue)
    }


}

new ProjectInput();