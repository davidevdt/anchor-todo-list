import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TodoListApp } from "../target/types/todo_list_app";
import { assert } from "chai";


describe("todo-list-app", () => {   // test-suite name 
  // Configure the client to use the local Solana cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.TodoListApp as Program<TodoListApp>; //  initialises the program variable with the Solana program object defined in the to-doListApp workspace
  const author = program.provider as anchor.AnchorProvider; // initialises the author variable with the program’s provider
  it("can create a task", async () => { //  starts a new test case within the test suite with the description “can create a task.”
  const task = anchor.web3.Keypair.generate(); // The private key of this keypair will sign the transaction so that the program can take up the ownership and use the public key of this keypair for the task account
  const tx = await program.methods 
  .addingTask("You are awesome") // This line calls the addingTask method of the program, which represents the adding_task function we previously discussed in the blog. It adds a new task with the text “You are awesome.” The method is asynchronous (async) as it interacts with the blockchain. The method returns a transaction (tx) that will be signed and sent to the network later.
  .accounts({ // specifies the accounts involved in the transaction. In this case, the task account is used as an argument to the adding_task function.
  task: task.publicKey, 
  systemProgram: anchor.web3.SystemProgram.programId,
  })
  .signers([task]) // we will add the task keypair here. If you are using a keypair other than the provider as the author, that keypair will also be required in the signers’ array.
  .rpc(); //  sends the transaction to the Solana network (RPC) and waits for confirmation. 
  console.log("Your transaction signature", tx); 
  
  
  const taskAccount = await program.account.task.fetch(task.publicKey); // This line fetches the task account created during the transaction by using the task’s public key (task.publicKey). It retrieves the most recent state of the task account from the blockchain.
  console.log("Your task", taskAccount); // This line logs the contents of the fetched task account to the console. It allows us to inspect the task account after it has been created and updated.
  
  
  assert.equal( // checks if the task’s author matches the author’s wallet public key. Since the author variable holds the program’s provider, author.wallet.publicKey gives the public key of the author’s wallet.
  taskAccount.author.toBase58(),
  author.wallet.publicKey.toBase58()
  );
  assert.equal(taskAccount.text, "You are awesome"); // This line checks if the task’s text matches the text provided during the task creation.
  assert.equal(taskAccount.isDone, false);
  assert.ok(taskAccount.createdAt);
  assert.ok(taskAccount.updatedAt);
  });

  // it("can create a new task from a different author", async () => {
  //   const user = anchor.web3.Keypair.generate();

  //   const signature = await program.provider.connection.requestAirdrop(
  //     user.publicKey,
  //     10000000000
  //   );

  //   const latestBlockHash =
  //     await program.provider.connection.getLatestBlockhash();

  //   await program.provider.connection.confirmTransaction({
  //     blockhash: latestBlockHash.blockhash,
  //     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  //     signature,
  //   });

  //   const task = anchor.web3.Keypair.generate();

  //   const tx = await program.methods
  //     .addingTask("You are more than awesome")
  //     .accounts({
  //       task: task.publicKey,
  //       author: user.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .signers([task, user])
  //     .rpc();

  //   console.log("Your transaction signature", tx);
  //   const taskAccount = await program.account.task.fetch(task.publicKey);
  //   console.log("Your task", taskAccount);

  //   assert.equal(taskAccount.author.toBase58(), user.publicKey.toBase58());
  //   assert.equal(taskAccount.text, "You are more than awesome");
  //   assert.equal(taskAccount.isDone, false);
  //   assert.ok(taskAccount.createdAt);
  //   assert.ok(taskAccount.updatedAt);
  // });

  // it("can fetch all tasks", async () => {
  //   const tasks = await program.account.task.all();
  //   console.log("Your tasks", tasks);
  // });

  // it("can filter tasks by author", async () => {
  //   const authorPublicKey = author.wallet.publicKey;
  //   console.log("authorPublicKey", authorPublicKey.toBase58());
  //   const tasks = await program.account.task.all([
  //     {
  //       memcmp: {
  //         offset: 8,
  //         bytes: authorPublicKey.toBase58(),
  //       },
  //     },
  //   ]);

  //   assert.equal(tasks.length, 1);
  // });

  // it("can update a task to done", async () => {
  //   const task = anchor.web3.Keypair.generate();
  //   // create a new task
  //   // fetch it from the same address
  //   // then update
  //   const tx = await program.methods
  //     .updatingTask(true)
  //     .accounts({
  //       task: task.publicKey,
  //       author: author.wallet.publicKey,
  //     })
  //     .signers([author])
  //     .rpc();

  //   console.log("Your transaction signature", tx);

  //   const taskAccount = await program.account.task.fetch(task.publicKey);
  //   console.log("Your task", taskAccount);

  //   assert.equal(
  //     taskAccount.author.toBase58(),
  //     author.wallet.publicKey.toBase58()
  //   );
  //   assert.equal(taskAccount.isDone, true);
  // });

  // it("cannot create a task with more than 400 characters", async () => {
  //   const task = anchor.web3.Keypair.generate();
  //   try {
  //     await program.methods
  //       .addingTask("You are awesome".repeat(100))
  //       .accounts({
  //         task: task.publicKey,
  //         author: author.wallet.publicKey,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .signers([task])
  //       .rpc();
  //     assert.fail("Expected an error");
  //   } catch (err) {
  //     assert.equal(err.toString(), "Error: failed to send transaction");
  //   }
  // });

  });
