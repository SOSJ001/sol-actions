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
        title: "Send some sol with Blink",
        icon: new URL("/Blink.jpg", new URL(req.url).origin).toString(),
        description: "Testing out Blink - FYI this is on mainnet-beta",
        label: "Send sol",
        disabled: false,
        links: {
            actions: [
                {
                    label: "Send 0.002 SOL",
                    // href: "http://localhost:3000/actions?amount=0.002",
                    href: "https://sol-actions.vercel.app/actions", 
                },
                {
                    label: "Send",
                    // href: "http://localhost:3000/actions?amount={amount}",
                    href: "https://sol-actions.vercel.app/actions", 
                    parameters: [
                        {
                            name: "amount", // field name
                            label: "Enter a custom sol amount" // text input placeholder
                        }
                    ]
                }
            ]
        },
        // error: { message: "Please try again. Keep Blinking." }
    };

    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
    });
};


export const OPTIONS = GET;





export const POST = async (req: Request) => {
    try {
        const url = new URL(req.url)
        const searchParams = new URLSearchParams(url.searchParams);
        const amountString = searchParams.get("amount")|| "0";
        const amountRegex = /^\d+(\.\d+)?$/; // Matches numbers with optional decimal point
        let amount: number 

        if (amountRegex.test(amountString)) {
            // Parse the validated string to a number
            amount = parseFloat(amountString);
            // console.log("amount is  ", amount + 1)
        }else{return}
        
        ;

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
                lamports: amount * LAMPORTS_PER_SOL,
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