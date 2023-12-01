use anchor_lang::prelude::*;

declare_id!("5DKzJ39FkCy4B6Y9NBhPVDAmd8BrJdR8RBTbCMYFSUH9");

#[program]
pub mod todo_list_app {
    use super::*;

    // The Context contains essential information about the program’s execution context, including accounts, program IDs, and more. 
    // In this case, it holds references to the accounts involved in the transaction, such as the task being added and 
    // the author’s account.
    // The text parameter is a string representing the content of the new task that the user wants to add
    // Ownership and the ability to modify the state of an account are crucial concepts when working with Solana accounts. Here, the program has ownership of the “Task” accounts it creates. 
    // This means that the program has the authority to modify the data stored in those accounts.
    pub fn adding_task(ctx: Context<AddingTask>, text: String) -> Result<()> {
        let task = &mut ctx.accounts.task; // creates a mutable reference to the task account. As accounts are immutable by default, we need to modify the fields of the task to add new information like the task text, author, timestamps, etc
        let author = &ctx.accounts.author; // The `author` account - This account represents the person who is adding the new task to the to-do list
        let clock = Clock::get().unwrap(); // Getting the current timestamp -  fetches the current timestamp from the blockchain using the Clock service provided by Solana
        
        if text.chars().count() > 400 {
            return Err(ErrorCode::TextTooLong.into());
        }
        
        task.author = *author.key;
        task.is_done = false;
        task.created_at = clock.unix_timestamp;
        task.updated_at = clock.unix_timestamp;
        task.text = text;
        Ok(())
    }

    // This function is used to update the status of a task (whether it’s done or not).
    pub fn updating_task(ctx: Context<UpdatingTask>, is_done: bool) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let author = &ctx.accounts.author; // The `author` account
        let clock = Clock::get().unwrap(); // Getting the current timestamp
        task.author = *author.key;
        task.is_done = is_done;
        task.updated_at = clock.unix_timestamp;
        Ok(())
    }

    // This function is used to mark a task as done, effectively “deleting” it from the active tasks list
    pub fn deleting_task(ctx: Context<DeletingTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let author = &ctx.accounts.author; // The `author` account
        let clock = Clock::get().unwrap(); // Getting the current timestamp
        task.author = *author.key;
        task.is_done = true;
        task.updated_at = clock.unix_timestamp;
        Ok(())
    }

}

#[derive(Accounts)]
    pub struct AddingTask<'info> { // The lifetime parameter is used to ensure that the accounts referenced in the struct are valid for the duration of the instruction execution.
    #[account(init, payer = author, space = Task::LEN)] // we declare that we are initialising, author is paying for it and the space would be LEN as we defined.
    pub task: Account<'info, Task>, // It represents an account of the type Task and will be used to read or modify data stored in the Task account during the instruction execution.
    #[account(mut)] // the author parameter should be mutable as we will be changing the balance of the account of the author when he pays
    pub author: Signer<'info>, // It represents a signer for the transaction, indicating that the author needs to sign the transaction for this instruction to be executed.
    pub system_program: Program<'info, System>, //  This is the official System program from Solana. As programs are stateless, we even need to pass through the official System Program. This program will be used to initialise the Task account.
}

#[account]
pub struct Task {
    pub author: Pubkey, // The account that owns the task
    pub is_done: bool, // Whether the task is done or not
    pub text: String, // The text of the task
    pub created_at: i64, // The timestamp when the task was created
    pub updated_at: i64, // The timestamp when the task was last updated
}

#[derive(Accounts)]
    pub struct UpdatingTask<'info> {
    #[account(mut, has_one = author)]
    pub task: Account<'info, Task>,
    pub author: Signer<'info>,
}

#[derive(Accounts)]
    pub struct DeletingTask<'info> {
    #[account(mut, has_one = author)]
    pub task: Account<'info, Task>,
    pub author: Signer<'info>,
}

const DISCRIMINATOR: usize = 8; // used to distinguish (through SHA-256 hash of the name, 'Task') from other structs
const PUBLIC_KEY_LENGTH: usize = 32;
const BOOL_LENGTH: usize = 1;
const TEXT_LENGTH: usize = 4 + 400 * 4; // 400 chars (max)
const TIMESTAMP_LENGTH: usize = 8;

impl Task {
    // it can be accessed as Task::LEN
    const LEN: usize = DISCRIMINATOR + // discriminator
    PUBLIC_KEY_LENGTH + // author
    BOOL_LENGTH + // is_done
    TEXT_LENGTH + // text
    TIMESTAMP_LENGTH + // created_at
    TIMESTAMP_LENGTH; // updated_at
}


#[error_code]
pub enum ErrorCode {
    #[msg("The text is too long")]
    TextTooLong,
}