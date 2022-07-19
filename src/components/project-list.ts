import { Droppable } from '../models/drag-and-drop.js';
import { Project } from '../models/project.js';
import { Autobind } from '../util/validation.js';
import BaseComponent from './base-component.js';
import { ProjectItem } from './project-item.js';
import { projectState } from '../state/project-state.js';
import { ProjectStatus } from './project-status.js';

export class ProjectList extends BaseComponent<HTMLElement, HTMLDivElement> implements Droppable {

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
