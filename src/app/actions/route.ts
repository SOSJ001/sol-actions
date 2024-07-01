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

export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
        title: "Send me 0.002 Sol",
        icon: new URL("/Blink.jpg", new URL(req.url).origin).toString(),
        description: "Testing out Blink",
        label: "Send sol",
        disabled: false,
        links: {
            actions: [
                {
                    label: "Send me 0.002 sol",
                    //href: "http://localhost:3000/actions",
                    href: "https://sol-actions.vercel.app/actions", 
                }
            ]
        }
    };

    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
    });
};


export const OPTIONS = GET;





export const POST = async (req: Request) => {
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
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: account,
                toPubkey: new PublicKey("3ZPcjHB48wwrHmpj1pMkH3ohbEaajpTVHZJuAw4TwVzL"),
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
                message: "We are Blinking peeps ",
            },
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