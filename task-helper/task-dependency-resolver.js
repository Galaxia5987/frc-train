import fs from 'node:fs';
import path from 'node:path';
import inquirer from 'inquirer';

const TASKS_DIR = path.join(process.cwd(), 'tasks');
const SOLUTIONS_DIR = path.join(process.cwd(), 'solutions');

function getDependencies(taskPath) {
  const mdPath = path.join(taskPath, 'TASK.md');
  if (!fs.existsSync(mdPath)) return [];

  const content = fs.readFileSync(mdPath, 'utf-8');
  const parts = content.split('## Dependencies');
  
  if (parts.length < 2) return [];

  const depsSection = parts[1];

  if (depsSection.trim() === "None") return [];
  
  return depsSection
    .split('\n')
    .map(line => line.trim());
}

async function runWizard() {
  console.log('Dependency Injection Wizard\n');

  // Locate all valid task directories excluding the main template
  const allTasks = fs.readdirSync(TASKS_DIR).filter(file => {
    const stat = fs.statSync(path.join(TASKS_DIR, file));
    return stat.isDirectory() && file !== 'main';
  });

  const tasksWithDeps = [];

  for (const task of allTasks) {
    const taskPath = path.join(TASKS_DIR, task);
    const deps = getDependencies(taskPath);
    if (deps.length > 0) {
      tasksWithDeps.push({ task, deps });
    }
  }

  if (tasksWithDeps.length === 0) {
    console.log('No tasks with dependencies found.');
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedTasks',
      message: 'Select tasks to inject dependencies and solutions into:',
      choices: tasksWithDeps.map(t => ({
        name: `${t.task} (Dependencies: ${t.deps.join(', ')})`,
        value: t
      }))
    }
  ]);

  const { selectedTasks } = answers;

  if (!selectedTasks || selectedTasks.length === 0) {
    console.log('No tasks selected.');
    return;
  }

  for (const { task, deps } of selectedTasks) {
    const targetTaskDir = path.join(TASKS_DIR, task);
    
    const languages = fs.readdirSync(targetTaskDir).filter(file => {
        const stat = fs.statSync(path.join(targetTaskDir, file));
        return stat.isDirectory();
    });

    for (const dep of deps) {
      for (const language of languages) {
        const targetLangDir = path.join(targetTaskDir, language);
        
        const depTaskDir = path.join(TASKS_DIR, dep, language);
        if (fs.existsSync(depTaskDir)) {
          console.log(`Injecting base task: ${dep}/${language} into ${task}/${language}`);
          fs.cpSync(depTaskDir, targetLangDir, { recursive: true, force: true });
        }

        const depSolutionDir = path.join(SOLUTIONS_DIR, dep, language);
        if (fs.existsSync(depSolutionDir)) {
          console.log(`Injecting solution: ${dep}/${language} into ${task}/${language}`);
          fs.cpSync(depSolutionDir, targetLangDir, { recursive: true, force: true });
        }
      }
    }
  }

  console.log('\nInjection complete.');
}

runWizard().catch(console.error);