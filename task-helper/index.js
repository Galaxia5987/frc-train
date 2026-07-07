import fs from 'node:fs';
import path from 'node:path';
import inquirer from 'inquirer';

const TASKS_DIR = path.join(process.cwd(), '../tasks');
const MAIN_DIR = path.join(TASKS_DIR, 'main');

async function runWizard() {
  console.log('Welcome to the frc-train Task Wizard\n');
  console.log(`Task dir: ${TASKS_DIR}, Main dir: ${MAIN_DIR}`);

  const languages = fs.existsSync(MAIN_DIR)
    ? fs.readdirSync(MAIN_DIR).filter(file => fs.statSync(path.join(MAIN_DIR, file)).isDirectory())
    : ['java', 'kotlin'];

  const availableTasks = fs.existsSync(TASKS_DIR)
    ? fs.readdirSync(TASKS_DIR).filter(file =>
        file !== 'main' && fs.statSync(path.join(TASKS_DIR, file)).isDirectory()
      )
    : [];

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'taskName',
      message: 'What is the name of the new task?',
      validate: input => input.trim() ? true : 'Task name cannot be empty.'
    },
    {
      type: 'select',
      name: 'language',
      message: 'Which language is this task for?',
      choices: languages
    },
    {
      type: 'checkbox',
      name: 'dependencies',
      message: 'Select dependencies to merge (space to select, enter to confirm):',
      choices: availableTasks,
      when: availableTasks.length > 0
    }
  ]);

  const { taskName, language, dependencies = [] } = answers;
  const targetTaskDir = path.join(TASKS_DIR, taskName);
  const targetLangDir = path.join(targetTaskDir, language);
  const mainLangDir = path.join(MAIN_DIR, language);

  fs.mkdirSync(targetLangDir, { recursive: true });

  for (const dep of dependencies) {
    const depLangDir = path.join(TASKS_DIR, dep, language);
    if (fs.existsSync(depLangDir)) {
      console.log(`Merging dependency: ${dep}...`);
      fs.cpSync(depLangDir, targetLangDir, { recursive: true, force: true });
    } else {
      console.warn(`Warning: Dependency '${dep}' does not have a '${language}' folder.`);
    }
  }

  if (fs.existsSync(mainLangDir)) {
     console.log('Applying main template...');
     fs.cpSync(mainLangDir, targetLangDir, { recursive: true, force: true });
  } else {
     console.warn(`Warning: Main template for '${language}' not found at ${mainLangDir}`);
  }

  const taskMdPath = path.join(targetLangDir, 'TASK.md');
  if (!fs.existsSync(taskMdPath)) {
    const mdContent = `# ${taskName}\n\n## Description\n\n##Requirements\n\n## Dependencies\n${
      dependencies.length > 0 ? dependencies.map(d => `- ${d}`).join('\n') : 'None'
    }\n`;
    fs.writeFileSync(taskMdPath, mdContent);
  }

  console.log(`\nTask '${taskName}' created successfully in tasks/${taskName}/${language}!`);
}

runWizard().catch(console.error);