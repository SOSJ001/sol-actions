import {
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
} from "@solana/actions";
import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";
import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
        title: "Receive some devnet sol",
        icon: new URL("/SOLUSDT.png", new URL(req.url).origin).toString(),
        description: "Enter your devnet address to receive some devnet sol",
        label: "Devnet sol",
        disabled: false,
        links: {
            actions: [
                {
                    label: "Send me 0.002 sol",
                    href: "http://localhost:3000/actions",
                }
            ]
        }
    };

    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
    });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;





export const POST = async (req: Request) => {
    const url = new URL(req.url); // Create a URL object from the request
    const amount = url.searchParams.get("amount"); // Get the "account" parameter
    try {

        const body: ActionPostRequest = await req.json(); //this is the body of the post request also the wallet address

        let account: PublicKey; //new variable to hold the public key
        try {
            // verifying the public key 
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid "account" provided', {
                status: 400,
                headers: ACTIONS_CORS_HEADERS,
            });
        }


        // after getting the public we build the transaction
        const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
        let sender = getKeypairFromEnvironment("SECRET_KEY")
        console.log("public key ", sender.publicKey);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: sender.publicKey,
                toPubkey: new PublicKey("HDCrEYrGwPBP2rqX1G7TqChzkN6ckRSpJBVF1YT1YPSF"),
                lamports: 0.002 * LAMPORTS_PER_SOL,
            })
        );

        // set the end user as the fee payer
        transaction.feePayer = account;

        transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
        ).blockhash;

        const payload: ActionPostResponse = await createPostResponse({
            //this will send the transaction to the blockchin and return the response 
            fields: {
                transaction,
                message: "We are Blinking people ",
            },
            // no additional signers are required for this transaction
            // signers: [],
        });

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    } catch (err) {
        console.log(err);
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        return new Response(message, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
};