import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-484067b9/health", (c) => {
  return c.json({ status: "ok" });
});



// Spotify API endpoint to fetch playlist tracks
app.get("/make-server-484067b9/spotify-playlist/:playlistId", async (c) => {
  try {
    const playlistId = c.req.param("playlistId");
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return c.json({ error: "Spotify API credentials not configured" }, 500);
    }

    // Get Spotify access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: "grant_type=client_credentials"
    });

    if (!tokenResponse.ok) {
      console.log("Failed to get Spotify token:", await tokenResponse.text());
      return c.json({ error: "Failed to authenticate with Spotify" }, 500);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch playlist tracks
    const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!playlistResponse.ok) {
      console.log("Failed to fetch playlist:", await playlistResponse.text());
      return c.json({ error: "Failed to fetch playlist data" }, 500);
    }

    const playlistData = await playlistResponse.json();
    
    // Format tracks for our music player
    const tracks = playlistData.items
      .filter((item: any) => item.track && item.track.preview_url) // Only tracks with preview URLs
      .map((item: any) => ({
        name: `${item.track.name} - ${item.track.artists[0].name}`,
        url: item.track.preview_url, // 30-second preview
        spotifyUrl: item.track.external_urls.spotify,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        image: item.track.album.images[0]?.url
      }));

    console.log(`Fetched ${tracks.length} tracks with preview URLs from Spotify playlist`);
    
    return c.json({ tracks });

  } catch (error) {
    console.log("Spotify API error:", error);
    return c.json({ error: "Internal server error while fetching Spotify data" }, 500);
  }
});



// Email verification endpoint using AbstractAPI
app.post("/make-server-484067b9/verify-email", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ 
        success: false,
        error: "Email address is required"
      }, 400);
    }
    
    const emailValidationApiKey = Deno.env.get("EMAIL_VALIDATION_API_KEY");
    if (!emailValidationApiKey) {
      console.log("EMAIL_VALIDATION_API_KEY not configured - skipping verification");
      return c.json({ 
        success: true,
        verified: true,
        message: "Email verification service not configured - proceeding with form submission",
        fallback: true
      });
    }
    
    // Call AbstractAPI Email Validation service
    const verificationUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${emailValidationApiKey}&email=${encodeURIComponent(email)}`;
    
    const verificationResponse = await fetch(verificationUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!verificationResponse.ok) {
      console.log("Email verification API error:", verificationResponse.status, await verificationResponse.text());
      return c.json({ 
        success: true,
        verified: true,
        message: "Email verification service temporarily unavailable - proceeding with form submission",
        fallback: true
      });
    }
    
    const verificationData = await verificationResponse.json();
    console.log("Email verification result for", email, ":", verificationData);
    
    // Check verification results
    const {
      is_valid_format,
      is_mx_found,
      is_smtp_valid,
      deliverability,
      is_disposable_email,
      is_role_email,
      is_free_email
    } = verificationData;
    
    // Determine if email should be accepted
    let isAcceptable = true;
    let errorMessage = "";
    
    if (!is_valid_format.value) {
      isAcceptable = false;
      errorMessage = "Invalid email format detected";
    } else if (!is_mx_found.value) {
      isAcceptable = false;
      errorMessage = "This email domain doesn't exist or cannot receive emails";
    } else if (!is_smtp_valid.value) {
      isAcceptable = false;
      errorMessage = "This email address doesn't exist or cannot receive emails";
    } else if (deliverability === "UNDELIVERABLE") {
      isAcceptable = false;
      errorMessage = "This email address is undeliverable";
    } else if (is_disposable_email.value) {
      isAcceptable = false;
      errorMessage = "Disposable/temporary email addresses are not allowed";
    }
    
    if (isAcceptable) {
      return c.json({ 
        success: true,
        verified: true,
        message: "Email address verified successfully",
        details: {
          is_free_email: is_free_email.value,
          is_role_email: is_role_email.value,
          deliverability: deliverability
        }
      });
    } else {
      return c.json({ 
        success: false,
        verified: false,
        error: errorMessage,
        details: verificationData
      });
    }
    
  } catch (error) {
    console.log("Email verification error:", error);
    return c.json({ 
      success: true,
      verified: true,
      message: "Email verification service error - proceeding with form submission",
      fallback: true
    });
  }
});

// Contact form email endpoint
app.post("/make-server-484067b9/send-email", async (c) => {
  try {
    const { name, email, message } = await c.req.json();
    
    // Basic validation
    if (!name || !email || !message) {
      return c.json({ 
        success: false,
        error: "Missing required fields: name, email, and message are required"
      }, 400);
    }
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured");
      return c.json({ 
        success: false,
        error: "Email service not configured"
      }, 500);
    }
    
    const contactEmail = {
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: ["shubhamsharma.ux@gmail.com"],
      subject: `📧 Contact Form Message from ${name} - ${new Date().toLocaleString()}`,
      html: `
        <h2>📧 New Contact Form Submission</h2>
        <p>You have received a new message through your portfolio contact form.</p>
        <hr>
        <h3>Contact Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Received at:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <hr>
        <h3>Message:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007cba;">${message}</p>
        <hr>
        <p><em>Reply directly to this email to respond to ${name} at ${email}</em></p>
      `,
      text: `New Contact Form Message from ${name} (${email}): ${message}. Received at ${new Date().toLocaleString()}`,
      reply_to: email
    };
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(contactEmail)
    });
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.log("Email API error:", errorText);
      
      return c.json({ 
        success: false,
        error: "Failed to send email"
      }, 500);
    }
    
    const result = await emailResponse.json();
    console.log("Contact form email sent successfully with ID:", result.id);
    
    return c.json({ 
      success: true,
      message: "Message sent successfully!",
      emailId: result.id
    });
    
  } catch (error) {
    console.log("Contact form error:", error);
    return c.json({ 
      success: false,
      error: "Internal server error"
    }, 500);
  }
});

Deno.serve(app.fetch);