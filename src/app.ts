// bind to class-instance
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

    // validate userInput

    interface ValidationConfig{
        [classDescription: string]:{
            [formField: string]: (string  | [string, number])[],
        }
    }

    let validator: ValidationConfig = {}

    function TitleValid(target: any, 
        propName: string){
        validator[target.constructor.name] = {
            ...validator[target.constructor.name],
            [propName]: [
                ...validator?.[target.constructor.name]?.[propName] ?? [],
                'title_valid']
        }
    }

    function DescriptionValid(target: any,
        propName: string){
            validator[target.constructor.name] = {
                ...validator[target.constructor.name],
                [propName]: [
                    ...validator?.[target.constructor.name]?.[propName] ?? [],
                'description_valid']
            }
        }

    function PeopleValid(target: any,
        propName: string){
            validator[target.constructor.name] = {
                ...validator[target.constructor.name],
                [propName]: [...validator?.[target.constructor.name]?.[propName] ?? [],'people_valid']
            }
        }

        function MinLength(minLength: number){
            console.log(`Minlength is: ${minLength}`);
            return function(target:any, propName: string){
                validator[target.constructor.name] = {
                    ...validator[target.constructor.name],
                    [propName]: [
                        ...validator?.[target.constructor.name]?.[propName] ?? [],
                        ['min_length', minLength]]
                };
            }
        }

function validate(obj: any){
    console.log(obj.constructor.name);
    const validatorInfo = validator[obj.constructor.name];
    console.log(validator);
    let isValid = true;
    for (const field in validatorInfo){
        console.log(field);
        console.log(validatorInfo[field])
        const validationType = validatorInfo[field];
        console.log(obj[field])
        for (const property of validationType){
        console.log(property);
        switch(property){
            case 'title_valid':
            case 'description_valid':
                isValid = isValid && obj[field].value.length > 0;
                break;
            case 'people_valid':
                isValid = isValid && +obj[field].value > 0;
                break;
            default:
                if (property.length === 2 && property[0] === 'min_length'){
                    console.log(`Minlength is : ${property[1]}`)
                    isValid = isValid && (obj[field].value + '').trim().length >= property[1];
                    break
                }
                isValid = false;
                break;


        }
    }
    }
    return isValid;
}

// Global state management

class ProjectState{

    projectList: any[] = [];
    listeners: Function[] = [];

    static instance: ProjectState;

    static getInstance(){
        if (!this.instance){
            this.instance = new ProjectState();
        }
        return this.instance;
    }

    private constructor(){

    }

    addProject(
        title: string,
        description: string,
        people: number
    ){
        this.projectList.push({
            id: Math.random(),
            title: title,
            description: description,
            people: people
        });

            for (const func of this.listeners){
                func(this.projectList.slice());
            }

    }

    addListener(listener: Function){
        this.listeners.push(listener);
    }
}

const projectState: ProjectState = ProjectState.getInstance();

// Project List

class ProjectList {
    templateElement: HTMLTemplateElement;
    divElement: HTMLDivElement;
    sectionElement: HTMLElement;

    constructor(private type: 'active'|'finished'){
        this.templateElement = document.getElementById('project-list') as HTMLTemplateElement;
        this.divElement = document.getElementById('app') as HTMLDivElement;

        let importedFromTemplate: DocumentFragment = document.importNode(this.templateElement.content, true);
        this.sectionElement = importedFromTemplate.firstElementChild as HTMLElement
        this.sectionElement.id = `${this.type}-projects`;

        projectState.addListener((project) => {})

        this.prerender();
        this.attach(this.sectionElement, this.divElement)
    }

    prerender(){
        const header = this.sectionElement.querySelector('h2') as HTMLHeadElement;
        header.innerHTML = `${this.type}-list`;
    }

    private attach(elementToAttach: HTMLElement, elementToAttachTo: HTMLElement){
        elementToAttachTo.insertAdjacentElement('beforeend', elementToAttach);
    }
}

// Project inputs
class ProjectInput {
    templateElement: HTMLTemplateElement;
    divElement: HTMLDivElement;
    formElement: HTMLFormElement;

    @TitleValid
    titleFormElement: HTMLInputElement;
    @DescriptionValid
    @MinLength(2)
    descriptionFormElement: HTMLInputElement;
    @PeopleValid
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

    /*
    private getUserInput(): [string, string, number] | void {
        const title = this.titleFormElement.value;
        const description = this.descriptionFormElement.value;
        const people = this.peopleFormElement.value;

        if (title.length === 0 || description.length === 0 || people.length === 0){
            alert('Invalid input');
            return;
        }

        return [title, description, +people];
    }*/

    @Autobind
    private submitValue(event: Event){

        event.preventDefault();
        console.log(this.titleFormElement.value);



        /*
        const userInputs = this.getUserInput();
        if (Array.isArray(userInputs)){
            console.log(userInputs)
            this.resetUserInputs();
        } */  
       if(!validate(this)){
        alert('Invalid Input');
       } else {
        alert('Beautifully input values')
       this.resetUserInputs();
       }
        const title = this.titleFormElement.value;
        const description = this.descriptionFormElement.value;
        const people = +this.peopleFormElement.value;

        projectState.addProject(title, description, people)

       
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

const projectInput: ProjectInput = new ProjectInput();
const projectListActive: ProjectList = new ProjectList('active');
const projectListFinished: ProjectList = new ProjectList('finished')
console.log(validate(projectInput));
