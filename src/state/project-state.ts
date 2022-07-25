import { Project } from '../models/project';
import { State } from './state';
import { ProjectStatus } from '../components/project-status';

export class ProjectState extends State<Project>{

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

export const projectState: ProjectState = ProjectState.getInstance();
