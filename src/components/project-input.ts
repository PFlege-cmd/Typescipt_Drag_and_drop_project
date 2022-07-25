import { Autobind, DescriptionValid, MinLength, PeopleValid, TitleValid, validate } from '../util/validation';
import BaseComponent from './base-component';
import { projectState } from '../state/project-state';

export class ProjectInput extends BaseComponent<HTMLFormElement, HTMLDivElement> {
    @TitleValid
    titleFormElement: HTMLInputElement;
    @DescriptionValid
    @MinLength(2)
    descriptionFormElement: HTMLInputElement;
    @PeopleValid
    peopleFormElement: HTMLInputElement

    constructor(){
        super(true,'project-input','app', 'user-input')
        this.titleFormElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionFormElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleFormElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure()
        this.attach(this.targetElement, this.element)
    }

    renderContent(): void {
        console.log("Empty method");
    }

    attach(elementToAttachTo: HTMLElement, elementToAttach: HTMLElement){
        elementToAttachTo.insertAdjacentElement('afterbegin', elementToAttach);
    }

    @Autobind
    private submitValue(event: Event){
        event.preventDefault();

        if(!validate(this)){
            alert('Invalid Input');
        } else {
            alert('Beautifully input values');
            const title = this.titleFormElement.value;
            const description = this.descriptionFormElement.value;
            const people = +this.peopleFormElement.value;

            projectState.addProject(title, description, people)
            this.resetUserInputs();
        }
    }

    private resetUserInputs(){
        this.titleFormElement.value = '';
        this.descriptionFormElement.value = '';
        this.peopleFormElement.value = '';
    }

    configure(){
        this.element.addEventListener('submit', this.submitValue)
    }
}

