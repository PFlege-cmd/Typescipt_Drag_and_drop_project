/// <reference path="drag-and-drop.ts" />

// bind to class-instance

namespace App {
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

// Enum

    enum ProjectStatus {
        ACTIVE,
        FINISHED
    }

// Project class

    class Project{
        constructor(
            public id: number,
            public title: string,
            public description: string,
            public people: number,
            public status: ProjectStatus
        ){}
    }

// Abstract state definition
    class State<T>{
        protected listeners: Listener<T>[] = [];

        addListener(listenerFn: Listener<T>){
            this.listeners.push(listenerFn);
        }
    }

// Listener function

    type Listener<T> = (project: T[]) => void;

// Global state management

    class ProjectState extends State<Project>{

        projectList: Project[] = [];

        static instance: ProjectState;

        static getInstance(){
            if (!this.instance){
                this.instance = new ProjectState();
            }
            return this.instance;
        }

        private constructor(){
            super();
        }

        addProject(
            title: string,
            description: string,
            people: number
        ){
            const newProject = new Project(
                Math.random(), title, description, people, ProjectStatus.ACTIVE
            );

            this.projectList.push(newProject);
            console.log(this.projectList)
            this.callListeners();
        }

        callListeners() {
            for (const func of this.listeners) {
                func(this.projectList.slice());
            }
        }

        moveProject(projectId: string, newStatus: ProjectStatus){
            const modifiedProject = this.projectList.find(project =>
                project.id === +projectId
            )
            if (modifiedProject && modifiedProject.status !== newStatus){
                modifiedProject.status = newStatus;
                this.callListeners();
            }
        }
    }

    const projectState: ProjectState = ProjectState.getInstance();

// Base class

    abstract class Component<T extends HTMLElement, U extends HTMLElement>{
        templateElement: HTMLTemplateElement;
        element: T;
        targetElement: U;

        constructor(
            public attachBefore: boolean,
            public templateId: string,
            public targetElementId: string,
            public elementId?:string){
            this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;
            console.log(`target-element id is: ${targetElementId}`)
            this.targetElement = document.getElementById(targetElementId) as U;
            console.log(`target is in super: ${this.targetElement}`);

            let importedFromTemplate: DocumentFragment = document.importNode(this.templateElement.content, true);
            this.element = importedFromTemplate.firstElementChild as T;
            if (elementId){
                this.element.id = elementId;
            }
        }

        abstract configure(): void;
        abstract renderContent(): void;
        protected attach(elementToAttach: HTMLElement, elementToAttachTo: HTMLElement){
            elementToAttachTo?.insertAdjacentElement(this.attachBefore?'afterbegin':'beforeend', elementToAttach);
        }
    }

// Project List

    class ProjectList extends Component<HTMLElement, HTMLDivElement> implements Droppable {

        assignedProjects: Project[] = [];

        constructor(private type: 'active'|'finished'){
            super(false, 'project-list', 'app', `${type}-projects`)

            console.log(`${this.element} is not null?`)
            console.log(`${this.targetElement} is a target?`)

            this.configure();
            this.renderContent();
            this.attach(this.element, this.targetElement)
        }

        @Autobind
        dragDropHandler(event: DragEvent): void {
            projectState.moveProject(
                event.dataTransfer!.getData('text/plain'),
                this.type === 'active'?ProjectStatus.ACTIVE:ProjectStatus.FINISHED
            );
            const listEl = this.element.querySelector('ul') as HTMLUListElement;
            listEl.classList.remove('droppable')
        }

        @Autobind
        dragOverHandler(event: DragEvent): void {
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                console.log(`This event is: ${event}`);
                const ulElement = this.element.querySelector('ul') as HTMLUListElement;
                ulElement.classList.add('droppable');
            }
        }
        @Autobind
        dragAndLeaveHandler(event: DragEvent): void {
            const ulElement = this.element.querySelector('ul') as HTMLUListElement;
            ulElement.classList.remove('droppable');
        }

        renderContent(){
            this.element.querySelector('ul')!.id = `${ this.type }-projects-list`;
            this.element.querySelector('h2')!.textContent = this.type.toUpperCase() +  ' PROJECTS';
        }

        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragAndLeaveHandler);
            this.element.addEventListener('drop', this.dragDropHandler);

            this.createListeners();
        }

        private createListeners() {
            projectState.addListener((projects: Project[]) => {
                this.assignedProjects = projects.filter(project => {
                    if (this.type === 'active'){
                        return project.status === ProjectStatus.ACTIVE
                    }
                    return project.status === ProjectStatus.FINISHED;
                })
                this.renderProjects();
            });
        }

        private renderProjects(){
            const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
            listEl.innerHTML = '';
            for (const project of this.assignedProjects){
                new ProjectItem(project, this.element.querySelector('ul')!.id);
            }
        }
    }

// Project inputs
    class ProjectInput extends Component<HTMLFormElement, HTMLDivElement> {
        @TitleValid
        titleFormElement: HTMLInputElement;
        @DescriptionValid
        @MinLength(2)
        descriptionFormElement: HTMLInputElement;
        @PeopleValid
        peopleFormElement: HTMLInputElement

        constructor(){
            super(true,'project-input','app', 'user-input')
            this.titleFormElement = this.element.querySelector('#title')!;
            this.descriptionFormElement = this.element.querySelector('#description')!;
            this.peopleFormElement = this.element.querySelector('#people')!;

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

    class ProjectItem extends Component<HTMLLIElement, HTMLUListElement> implements Draggable{

        project: Project;

        get persons(){
            if (this.project.people === 1)
                return this.project.people + ' person assigned'

            return this.project.people + ' persons assigned'
        }

        @Autobind
        dragStartHandler(event: DragEvent): void {
            event.dataTransfer!.setData('text/plain', this.element.id);
            event.dataTransfer!.effectAllowed= 'move';
        }


        dragEndHandler(_event: DragEvent): void {
            console.log("Dragend")
        }

        constructor(project: Project, targetId: string){
            super(false, 'single-project', targetId, project.id.toString())
            this.project = project;
            this.renderContent();
            this.configure();
        }



        configure(): void {
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
        }

        renderContent(): void {
            this.element.querySelector('h3')!.textContent = this.project.title;
            this.element.querySelector('h2')!.textContent = this.project.description;
            this.element.querySelector('p')!.textContent = this.persons;

            this.attach(this.element, this.targetElement);
        }
    }

    const projectInput: ProjectInput = new ProjectInput();
    new ProjectList('active');
    new ProjectList('finished')
    console.log(validate(projectInput));
}
