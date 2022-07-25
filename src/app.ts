import { ProjectInput } from './components/project-input';
import { ProjectList } from './components/project-list';
import { validate } from './util/validation';


const projectInput: ProjectInput = new ProjectInput();
new ProjectList('active');
new ProjectList('finished')
console.log(validate(projectInput));

