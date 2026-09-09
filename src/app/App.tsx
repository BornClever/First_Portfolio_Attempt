import { useState, useEffect } from "react";
import * as React from "react";

import RetroDevice from "./components/RetroDevice";
import RetroMacApp from "./components/RetroMacApp";
import CustomCursor from "./components/CustomCursor";
import DigitalStopwatch from "./components/DigitalStopwatch";
import {
  projectId,
  publicAnonKey,
} from "./utils/supabase/info";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { getUXContent } from "./constants/ux-content";
import {
  nextLetter,
  prevLetter,
  incrementNumber,
  decrementNumber,
  getFontFamily,
} from "./utils/character-picker";
import { validateEmail } from "./utils/form-validation";

export default function App() {
  const [pressedButton, setPressedButton] = useState<
    string | null
  >(null);
  const [heldButton, setHeldButton] = useState<string | null>(
    null,
  );
  const [heldButtons, setHeldButtons] = useState<Set<string>>(
    new Set(),
  ); // Track multiple held buttons
  const [joystickPosition, setJoystickPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [joystickTouchId, setJoystickTouchId] = useState<
    number | null
  >(null); // Track joystick touch ID
  const [buttonTouchIds, setButtonTouchIds] = useState<
    Map<string, number>
  >(new Map()); // Track button touch IDs
  const [messageStatus, setMessageStatus] = useState<
    "idle" | "verifying" | "sending" | "sent" | "error"
  >("idle"); // Track message send status
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  }); // Form data state
  const [showSuccessAnimation, setShowSuccessAnimation] =
    useState(false); // Control success animations
  const [emailValidationError, setEmailValidationError] =
    useState<string | null>(null); // Email validation error message
  const [showEmailError, setShowEmailError] = useState(false); // Control email error display
  const [emailInputShake, setEmailInputShake] = useState(false); // Control email input shake animation

  // Interactive Joystick Character Picker State
  const [character, setCharacter] = useState<string>("A");
  const [number, setNumber] = useState<number>(0);
  const [comboMode, setComboMode] = useState<boolean>(false);
  const [fontStyle, setFontStyle] =
    useState<string>("Silkscreen");
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [gameStarted, setGameStarted] =
    useState<boolean>(false);
  const [lastJoystickDirection, setLastJoystickDirection] =
    useState<string | null>(null);
  const [continuousDirection, setContinuousDirection] =
    useState<string | null>(null);
  const [showUXDialog, setShowUXDialog] =
    useState<boolean>(false);

  // Resume Application State
  const [showResumeApp, setShowResumeApp] =
    useState<boolean>(false);
  const [resumeAppShake, setResumeAppShake] =
    useState<boolean>(false);

  // Keyboard controls state
  const [keysPressed, setKeysPressed] = useState<Set<string>>(
    new Set(),
  );
  const [keyboardDirection, setKeyboardDirection] = useState<
    string | null
  >(null);

  // Smart resume app click handler
  const handleResumeClick = () => {
    if (showResumeApp) {
      // App is already open - trigger shake animation
      setResumeAppShake(true);
      setTimeout(() => setResumeAppShake(false), 600); // Reset shake after animation
    } else {
      // App is not open - open it normally
      setShowResumeApp(true);
    }
  };

  // Helper functions for error dialog buttons
  const handleFixEmailClick = () => {
    console.log("Fix Email button clicked");
    setShowEmailError(false);
    setEmailValidationError(null);
    setEmailInputShake(false);
    setMessageStatus("idle");

    // Focus and select the email input after a short delay to ensure dialog closes
    setTimeout(() => {
      const emailInput = document.querySelector(
        'input[name="email"]',
      ) as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
        emailInput.select();
        console.log("Email input focused and selected");
      } else {
        console.log("Email input not found");
      }
    }, 150);
  };

  const handleDismissErrorClick = () => {
    console.log("Dismiss button clicked");
    setShowEmailError(false);
    setEmailValidationError(null);
    setEmailInputShake(false);
    setMessageStatus("idle");
  };

  const handleButtonClick = (buttonId: string) => {
    // Handle arcade button functionality
    if (gameStarted) {
      switch (buttonId) {
        case "lp":
          setFontStyle("Silkscreen");
          break;
        case "mp":
          setFontStyle("IBM Plex Mono");
          break;
        case "hp":
          setFontStyle("Press Start 2P");
          break;
        case "lk":
          setFontStyle("Share Tech Mono");
          break;
        case "mk":
          setFontStyle("VT323");
          break;
        case "hk":
          setFontStyle("Orbitron");
          break;
        case "select":
          if (gameStarted) {
            setShowUXDialog(true);
          }
          break;
      }
    }

    if (buttonId === "start") {
      if (!gameStarted) {
        setGameStarted(true);
        setCharacter("A");
        setNumber(0);
        setComboMode(false);
        setWheelRotation(0);
      } else {
        // Close/reset the game
        setGameStarted(false);
        setCharacter("A");
        setNumber(0);
        setComboMode(false);
        setWheelRotation(0);
        setLastJoystickDirection(null);
        setContinuousDirection(null);
        setKeyboardDirection(null);
        setKeysPressed(new Set());
      }
    }

    // Only trigger quick press animation if button is not being held
    if (!heldButtons.has(buttonId)) {
      setPressedButton(buttonId);
      setTimeout(() => setPressedButton(null), 150); // Quick press animation
    }
  };

  const handleButtonMouseDown = (buttonId: string) => {
    setHeldButton(buttonId);
    setHeldButtons((prev) => new Set(prev).add(buttonId));
    setPressedButton(null); // Clear any quick press animation
  };

  const handleButtonMouseUp = () => {
    setHeldButton(null);
    setHeldButtons(new Set()); // Clear all held buttons for mouse
  };

  const handleButtonMouseLeave = () => {
    setHeldButton(null);
    setHeldButtons(new Set()); // Clear all held buttons when mouse leaves
  };

  // Enhanced touch event handlers for multitouch support
  const handleButtonTouchStart = (
    buttonId: string,
    e: React.TouchEvent,
  ) => {
    e.preventDefault(); // Prevent scrolling and other touch behaviors

    // Find the first available touch that's not already tracked
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const touchId = touch.identifier;

      // Check if this touch is already being used by another button or the joystick
      const isAlreadyUsed =
        Array.from(buttonTouchIds.values()).includes(touchId) ||
        joystickTouchId === touchId;

      if (!isAlreadyUsed) {
        setButtonTouchIds((prev) =>
          new Map(prev).set(buttonId, touchId),
        );
        setHeldButtons((prev) => new Set(prev).add(buttonId));
        setPressedButton(null);
        break;
      }
    }
  };

  const handleButtonTouchEnd = (
    buttonId: string,
    e: React.TouchEvent,
  ) => {
    e.preventDefault();

    // Check if this button's touch ended
    const buttonTouchId = buttonTouchIds.get(buttonId);
    if (buttonTouchId !== undefined) {
      const touchStillActive = Array.from(e.touches).some(
        (touch) => touch.identifier === buttonTouchId,
      );

      if (!touchStillActive) {
        // Trigger the button click functionality for mobile
        handleButtonClick(buttonId);

        setButtonTouchIds((prev) => {
          const newMap = new Map(prev);
          newMap.delete(buttonId);
          return newMap;
        });
        setHeldButtons((prev) => {
          const newSet = new Set(prev);
          newSet.delete(buttonId);
          return newSet;
        });
      }
    }
  };

  // Check if button should appear pressed (either quick press or held)
  const isButtonPressed = (buttonId: string) => {
    return (
      pressedButton === buttonId ||
      heldButton === buttonId ||
      heldButtons.has(buttonId)
    );
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle message form submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission and page refresh

    if (messageStatus !== "idle") {
      return; // Prevent multiple clicks
    }

    // Validate form data
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      alert("Please fill in all fields before sending.");
      return;
    }

    // First check email format
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setEmailValidationError(emailValidation.error);
      setShowEmailError(true);
      setMessageStatus("error");

      // Trigger email input shake animation
      setEmailInputShake(true);
      setTimeout(() => setEmailInputShake(false), 600);

      // Auto-hide error after 8 seconds
      setTimeout(() => {
        setShowEmailError(false);
        setEmailValidationError(null);
        setMessageStatus("idle");
      }, 8000);

      return;
    }

    // Clear any existing email validation errors and set status to verifying
    setEmailValidationError(null);
    setShowEmailError(false);
    setEmailInputShake(false);
    setMessageStatus("verifying");

    // Verify email existence with API
    try {
      const verifyResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-484067b9/verify-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        },
      );

      if (!verifyResponse.ok) {
        console.log(
          "Email verification API request failed:",
          verifyResponse.status,
        );
        // Continue with form submission if verification API fails
        setMessageStatus("sending");
      } else {
        const verifyResult = await verifyResponse.json();
        console.log("Email verification result:", verifyResult);

        if (!verifyResult.success || !verifyResult.verified) {
          setEmailValidationError(
            verifyResult.error || "Email verification failed",
          );
          setShowEmailError(true);
          setMessageStatus("error");

          // Trigger email input shake animation
          setEmailInputShake(true);
          setTimeout(() => setEmailInputShake(false), 600);

          // Auto-hide error after 10 seconds for verification errors
          setTimeout(() => {
            setShowEmailError(false);
            setEmailValidationError(null);
            setMessageStatus("idle");
          }, 10000);

          return;
        }

        // If verification passed, show any warnings but continue
        if (verifyResult.fallback) {
          console.log(
            "Email verification fallback:",
            verifyResult.message,
          );
        }

        setMessageStatus("sending");
      }
    } catch (verifyError) {
      console.log("Email verification error:", verifyError);
      // Continue with form submission if verification fails
      setMessageStatus("sending");
    }

    // Start sending animation
    setMessageStatus("sending");

    try {
      const requestPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-484067b9/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(requestPayload),
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setMessageStatus("sent");
        setShowSuccessAnimation(true);

        // Clear form and validation states on successful send
        setFormData({
          name: "",
          email: "",
          message: "",
        });

        // Clear any email validation errors
        setEmailValidationError(null);
        setShowEmailError(false);
        setEmailInputShake(false);

        // Reset animations and status
        setTimeout(() => {
          setShowSuccessAnimation(false);
          setMessageStatus("idle");
        }, 3000); // Show "sent" message for 3 seconds
      } else {
        console.error("Email sending failed:", result.error);

        // Show specific error message if available
        const errorMsg =
          result.error ||
          "Failed to send message. Please try again.";
        setEmailValidationError(
          `Email sending failed: ${errorMsg}`,
        );
        setShowEmailError(true);

        setMessageStatus("error");

        // Reset to idle after showing error
        setTimeout(() => {
          setMessageStatus("idle");
          setShowEmailError(false);
          setEmailValidationError(null);
          setEmailInputShake(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Network error sending email:", error);
      setMessageStatus("error");

      setEmailValidationError(
        "Network error: Please check your connection and try again.",
      );
      setShowEmailError(true);

      // Reset to idle after showing error
      setTimeout(() => {
        setMessageStatus("idle");
        setShowEmailError(false);
        setEmailValidationError(null);
        setEmailInputShake(false);
      }, 5000);
    }
  };

  const handleJoystickMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleJoystickMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Calculate distance from center
      const distance = Math.sqrt(
        deltaX * deltaX + deltaY * deltaY,
      );
      const maxDistance = 40; // Maximum movement radius within the circular base

      // Constrain movement within circular area
      let x = deltaX;
      let y = deltaY;

      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        x = Math.cos(angle) * maxDistance;
        y = Math.sin(angle) * maxDistance;
      }

      setJoystickPosition({ x, y });

      // Handle character picker interactions if game is started
      if (gameStarted && distance > 15) {
        // Minimum distance threshold
        const angle = Math.atan2(deltaY, deltaX);
        const angleDeg = ((angle * 180) / Math.PI + 360) % 360;

        let direction = "";

        // Determine direction based on angle
        if (angleDeg >= 315 || angleDeg < 45) {
          direction = "right";
        } else if (angleDeg >= 45 && angleDeg < 135) {
          direction = "down";
        } else if (angleDeg >= 135 && angleDeg < 225) {
          direction = "left";
        } else if (angleDeg >= 225 && angleDeg < 315) {
          direction = "up";
        }

        // Check for diagonal movements (combo mode)
        let isDiagonal = false;
        let diagonalDirection = "";

        if (angleDeg >= 30 && angleDeg < 60) {
          isDiagonal = true;
          diagonalDirection = "down-right";
        } else if (angleDeg >= 120 && angleDeg < 150) {
          isDiagonal = true;
          diagonalDirection = "down-left";
        } else if (angleDeg >= 210 && angleDeg < 240) {
          isDiagonal = true;
          diagonalDirection = "up-left";
        } else if (angleDeg >= 300 && angleDeg < 330) {
          isDiagonal = true;
          diagonalDirection = "up-right";
        }

        // Set the continuous direction for interval updates
        const currentDirection = isDiagonal
          ? diagonalDirection
          : direction;
        setContinuousDirection(currentDirection);

        // Only process immediate change if direction changed (first-time trigger)
        if (currentDirection !== lastJoystickDirection) {
          setLastJoystickDirection(currentDirection);

          if (isDiagonal) {
            setComboMode(true);
            let newNumber = number;
            let newCharacter = character;
            let rotation = wheelRotation;

            switch (diagonalDirection) {
              case "up-right":
                newNumber = incrementNumber(number);
                newCharacter = nextLetter(character);
                rotation += 35; // Combined rotation
                break;
              case "up-left":
                newNumber = incrementNumber(number);
                rotation += 20;
                break;
              case "down-right":
                newNumber = decrementNumber(number);
                newCharacter = nextLetter(character);
                rotation -= 5; // Combined rotation
                break;
              case "down-left":
                newNumber = decrementNumber(number);
                rotation -= 20;
                break;
            }

            setNumber(newNumber);
            setCharacter(newCharacter);
            setWheelRotation(rotation);
          } else {
            setComboMode(false);

            switch (direction) {
              case "right":
                setCharacter(nextLetter(character));
                setWheelRotation(wheelRotation + 15);
                break;
              case "left":
                setCharacter(prevLetter(character));
                setWheelRotation(wheelRotation - 15);
                break;
              case "up":
                setNumber(incrementNumber(number));
                setWheelRotation(wheelRotation + 20);
                break;
              case "down":
                setNumber(decrementNumber(number));
                setWheelRotation(wheelRotation - 20);
                break;
            }
          }
        }
      } else {
        // Stop continuous updates when not in valid direction
        setContinuousDirection(null);
      }
    },
    [
      isDragging,
      dragStart,
      gameStarted,
      character,
      number,
      wheelRotation,
      lastJoystickDirection,
    ],
  );

  const handleJoystickMouseUp = React.useCallback(() => {
    setIsDragging(false);
    // Spring back to center with smooth animation
    setJoystickPosition({ x: 0, y: 0 });
    // Reset direction tracking
    setLastJoystickDirection(null);
    // Stop continuous updates
    setContinuousDirection(null);
  }, []);

  // Enhanced touch event handlers for joystick multitouch support
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the first available touch that's not already being used by buttons
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const touchId = touch.identifier;

      // Check if this touch is already being used by a button
      const isAlreadyUsed = Array.from(
        buttonTouchIds.values(),
      ).includes(touchId);

      if (!isAlreadyUsed && joystickTouchId === null) {
        setJoystickTouchId(touchId);
        setIsDragging(true);
        setDragStart({ x: touch.clientX, y: touch.clientY });
        break;
      }
    }
  };

  const handleJoystickTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isDragging || joystickTouchId === null) return;

      // Find the specific touch that belongs to the joystick
      const joystickTouch = Array.from(e.touches).find(
        (touch) => touch.identifier === joystickTouchId,
      );
      if (!joystickTouch) return;

      const deltaX = joystickTouch.clientX - dragStart.x;
      const deltaY = joystickTouch.clientY - dragStart.y;

      // Calculate distance from center
      const distance = Math.sqrt(
        deltaX * deltaX + deltaY * deltaY,
      );
      const maxDistance = 40; // Maximum movement radius within the circular base

      // Constrain movement within circular area
      let x = deltaX;
      let y = deltaY;

      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        x = Math.cos(angle) * maxDistance;
        y = Math.sin(angle) * maxDistance;
      }

      setJoystickPosition({ x, y });

      // Handle character picker interactions for touch (same logic as mouse)
      if (gameStarted && distance > 15) {
        const angle = Math.atan2(deltaY, deltaX);
        const angleDeg = ((angle * 180) / Math.PI + 360) % 360;

        let direction = "";

        if (angleDeg >= 315 || angleDeg < 45) {
          direction = "right";
        } else if (angleDeg >= 45 && angleDeg < 135) {
          direction = "down";
        } else if (angleDeg >= 135 && angleDeg < 225) {
          direction = "left";
        } else if (angleDeg >= 225 && angleDeg < 315) {
          direction = "up";
        }

        let isDiagonal = false;
        let diagonalDirection = "";

        if (angleDeg >= 30 && angleDeg < 60) {
          isDiagonal = true;
          diagonalDirection = "down-right";
        } else if (angleDeg >= 120 && angleDeg < 150) {
          isDiagonal = true;
          diagonalDirection = "down-left";
        } else if (angleDeg >= 210 && angleDeg < 240) {
          isDiagonal = true;
          diagonalDirection = "up-left";
        } else if (angleDeg >= 300 && angleDeg < 330) {
          isDiagonal = true;
          diagonalDirection = "up-right";
        }

        // Set continuous direction for touch interactions too
        const currentDirection = isDiagonal
          ? diagonalDirection
          : direction;
        setContinuousDirection(currentDirection);

        if (currentDirection !== lastJoystickDirection) {
          setLastJoystickDirection(currentDirection);

          if (isDiagonal) {
            setComboMode(true);
            let newNumber = number;
            let newCharacter = character;
            let rotation = wheelRotation;

            switch (diagonalDirection) {
              case "up-right":
                newNumber = incrementNumber(number);
                newCharacter = nextLetter(character);
                rotation += 35;
                break;
              case "up-left":
                newNumber = incrementNumber(number);
                rotation += 20;
                break;
              case "down-right":
                newNumber = decrementNumber(number);
                newCharacter = nextLetter(character);
                rotation -= 5;
                break;
              case "down-left":
                newNumber = decrementNumber(number);
                rotation -= 20;
                break;
            }

            setNumber(newNumber);
            setCharacter(newCharacter);
            setWheelRotation(rotation);
          } else {
            setComboMode(false);

            switch (direction) {
              case "right":
                setCharacter(nextLetter(character));
                setWheelRotation(wheelRotation + 15);
                break;
              case "left":
                setCharacter(prevLetter(character));
                setWheelRotation(wheelRotation - 15);
                break;
              case "up":
                setNumber(incrementNumber(number));
                setWheelRotation(wheelRotation + 20);
                break;
              case "down":
                setNumber(decrementNumber(number));
                setWheelRotation(wheelRotation - 20);
                break;
            }
          }
        }
      } else {
        // Stop continuous updates when not in valid direction
        setContinuousDirection(null);
      }
    },
    [
      isDragging,
      dragStart,
      joystickTouchId,
      gameStarted,
      character,
      number,
      wheelRotation,
      lastJoystickDirection,
    ],
  );

  const handleJoystickTouchEnd = React.useCallback(
    (e: TouchEvent) => {
      if (joystickTouchId === null) return;

      // Check if the joystick's touch ended
      const joystickTouchStillActive = Array.from(
        e.touches,
      ).some((touch) => touch.identifier === joystickTouchId);

      if (!joystickTouchStillActive) {
        setJoystickTouchId(null);
        setIsDragging(false);
        // Spring back to center with smooth animation
        setJoystickPosition({ x: 0, y: 0 });
        // Reset direction tracking
        setLastJoystickDirection(null);
        // Stop continuous updates
        setContinuousDirection(null);
      }
    },
    [joystickTouchId],
  );

  // Global touch cleanup handler
  const handleGlobalTouchEnd = React.useCallback(
    (e: TouchEvent) => {
      // Clean up any button touches that ended
      const activeTouchIds = Array.from(e.touches).map(
        (touch) => touch.identifier,
      );

      // Check for button touches that ended and trigger clicks
      setButtonTouchIds((prev) => {
        const newMap = new Map(prev);
        let changed = false;

        for (const [buttonId, touchId] of prev.entries()) {
          if (!activeTouchIds.includes(touchId)) {
            // Trigger button click when touch ends
            handleButtonClick(buttonId);
            newMap.delete(buttonId);
            changed = true;
          }
        }

        if (changed) {
          setHeldButtons((currentHeld) => {
            const newSet = new Set(currentHeld);
            for (const [buttonId, touchId] of prev.entries()) {
              if (!activeTouchIds.includes(touchId)) {
                newSet.delete(buttonId);
              }
            }
            return newSet;
          });
        }

        return changed ? newMap : prev;
      });

      // Handle joystick touch cleanup
      handleJoystickTouchEnd(e);
    },
    [handleJoystickTouchEnd],
  );

  // Add global mouse and touch event listeners for smooth dragging
  React.useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener(
        "mousemove",
        handleJoystickMouseMove,
      );
      document.addEventListener(
        "mouseup",
        handleJoystickMouseUp,
      );

      // Touch events
      document.addEventListener(
        "touchmove",
        handleJoystickTouchMove,
        { passive: false },
      );
      document.addEventListener(
        "touchend",
        handleJoystickTouchEnd,
      );

      return () => {
        // Clean up mouse events
        document.removeEventListener(
          "mousemove",
          handleJoystickMouseMove,
        );
        document.removeEventListener(
          "mouseup",
          handleJoystickMouseUp,
        );

        // Clean up touch events
        document.removeEventListener(
          "touchmove",
          handleJoystickTouchMove,
        );
        document.removeEventListener(
          "touchend",
          handleJoystickTouchEnd,
        );
      };
    }
  }, [
    isDragging,
    handleJoystickMouseMove,
    handleJoystickMouseUp,
    handleJoystickTouchMove,
    handleJoystickTouchEnd,
  ]);

  // Global touch cleanup listener
  React.useEffect(() => {
    document.addEventListener(
      "touchend",
      handleGlobalTouchEnd,
      { passive: false },
    );
    document.addEventListener(
      "touchcancel",
      handleGlobalTouchEnd,
      { passive: false },
    );

    return () => {
      document.removeEventListener(
        "touchend",
        handleGlobalTouchEnd,
      );
      document.removeEventListener(
        "touchcancel",
        handleGlobalTouchEnd,
      );
    };
  }, [handleGlobalTouchEnd]);

  // Keyboard event handlers
  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!gameStarted) return;

      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        e.preventDefault(); // Prevent scrolling and other default behaviors

        setKeysPressed((prev) => {
          const newKeys = new Set(prev);
          newKeys.add(key);
          return newKeys;
        });
      }
    },
    [gameStarted],
  );

  const handleKeyUp = React.useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      e.preventDefault();

      setKeysPressed((prev) => {
        const newKeys = new Set(prev);
        newKeys.delete(key);
        return newKeys;
      });
    }
  }, []);

  // Convert pressed keys to direction
  React.useEffect(() => {
    if (!gameStarted || keysPressed.size === 0) {
      setKeyboardDirection(null);
      return;
    }

    const hasW = keysPressed.has("w");
    const hasA = keysPressed.has("a");
    const hasS = keysPressed.has("s");
    const hasD = keysPressed.has("d");

    // Determine direction based on key combinations
    let direction = "";

    if (hasW && hasD) {
      direction = "up-right";
    } else if (hasW && hasA) {
      direction = "up-left";
    } else if (hasS && hasD) {
      direction = "down-right";
    } else if (hasS && hasA) {
      direction = "down-left";
    } else if (hasW) {
      direction = "up";
    } else if (hasS) {
      direction = "down";
    } else if (hasA) {
      direction = "left";
    } else if (hasD) {
      direction = "right";
    }

    setKeyboardDirection(direction || null);
  }, [gameStarted, keysPressed]);

  // Handle keyboard direction changes
  React.useEffect(() => {
    if (!gameStarted || !keyboardDirection) return;

    // Process the initial direction change
    if (keyboardDirection.includes("-")) {
      // Diagonal movement
      setComboMode(true);

      switch (keyboardDirection) {
        case "up-right":
          setNumber((prev) => incrementNumber(prev));
          setCharacter((prev) => nextLetter(prev));
          setWheelRotation((prev) => prev + 35);
          break;
        case "up-left":
          setNumber((prev) => incrementNumber(prev));
          setCharacter((prev) => prevLetter(prev));
          setWheelRotation((prev) => prev + 20);
          break;
        case "down-right":
          setNumber((prev) => decrementNumber(prev));
          setCharacter((prev) => nextLetter(prev));
          setWheelRotation((prev) => prev - 5);
          break;
        case "down-left":
          setNumber((prev) => decrementNumber(prev));
          setCharacter((prev) => prevLetter(prev));
          setWheelRotation((prev) => prev - 20);
          break;
      }
    } else {
      // Cardinal direction
      setComboMode(false);

      switch (keyboardDirection) {
        case "up":
          setNumber((prev) => incrementNumber(prev));
          setWheelRotation((prev) => prev + 20);
          break;
        case "down":
          setNumber((prev) => decrementNumber(prev));
          setWheelRotation((prev) => prev - 20);
          break;
        case "left":
          setCharacter((prev) => prevLetter(prev));
          setWheelRotation((prev) => prev - 15);
          break;
        case "right":
          setCharacter((prev) => nextLetter(prev));
          setWheelRotation((prev) => prev + 15);
          break;
      }
    }
  }, [gameStarted, keyboardDirection]);

  // Continuous keyboard updates - similar to joystick continuous updates
  React.useEffect(() => {
    if (!gameStarted || !keyboardDirection) return;

    const interval = setInterval(() => {
      if (keyboardDirection.includes("-")) {
        // Diagonal movement
        setComboMode(true);

        switch (keyboardDirection) {
          case "up-right":
            setNumber((prev) => incrementNumber(prev));
            setCharacter((prev) => nextLetter(prev));
            setWheelRotation((prev) => prev + 35);
            break;
          case "up-left":
            setNumber((prev) => incrementNumber(prev));
            setCharacter((prev) => prevLetter(prev));
            setWheelRotation((prev) => prev + 20);
            break;
          case "down-right":
            setNumber((prev) => decrementNumber(prev));
            setCharacter((prev) => nextLetter(prev));
            setWheelRotation((prev) => prev - 5);
            break;
          case "down-left":
            setNumber((prev) => decrementNumber(prev));
            setCharacter((prev) => prevLetter(prev));
            setWheelRotation((prev) => prev - 20);
            break;
        }
      } else {
        // Cardinal direction
        setComboMode(false);

        switch (keyboardDirection) {
          case "up":
            setNumber((prev) => incrementNumber(prev));
            setWheelRotation((prev) => prev + 20);
            break;
          case "down":
            setNumber((prev) => decrementNumber(prev));
            setWheelRotation((prev) => prev - 20);
            break;
          case "left":
            setCharacter((prev) => prevLetter(prev));
            setWheelRotation((prev) => prev - 15);
            break;
          case "right":
            setCharacter((prev) => nextLetter(prev));
            setWheelRotation((prev) => prev + 15);
            break;
        }
      }
    }, 120); // Same speed as joystick continuous updates

    return () => clearInterval(interval);
  }, [gameStarted, keyboardDirection]);

  // Add keyboard event listeners
  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Continuous joystick updates - change values continuously while held in direction
  React.useEffect(() => {
    if (!gameStarted || !isDragging || !continuousDirection)
      return;

    const interval = setInterval(() => {
      if (continuousDirection.includes("-")) {
        // Diagonal movement
        setComboMode(true);
        let newNumber = number;
        let newCharacter = character;
        let rotation = wheelRotation;

        switch (continuousDirection) {
          case "up-right":
            setNumber((prev) => incrementNumber(prev));
            setCharacter((prev) => nextLetter(prev));
            setWheelRotation((prev) => prev + 35);
            break;
          case "up-left":
            setNumber((prev) => incrementNumber(prev));
            setWheelRotation((prev) => prev + 20);
            break;
          case "down-right":
            setNumber((prev) => decrementNumber(prev));
            setCharacter((prev) => nextLetter(prev));
            setWheelRotation((prev) => prev - 5);
            break;
          case "down-left":
            setNumber((prev) => decrementNumber(prev));
            setWheelRotation((prev) => prev - 20);
            break;
        }
      } else {
        // Cardinal direction
        setComboMode(false);

        switch (continuousDirection) {
          case "right":
            setCharacter((prev) => nextLetter(prev));
            setWheelRotation((prev) => prev + 15);
            break;
          case "left":
            setCharacter((prev) => prevLetter(prev));
            setWheelRotation((prev) => prev - 15);
            break;
          case "up":
            setNumber((prev) => incrementNumber(prev));
            setWheelRotation((prev) => prev + 20);
            break;
          case "down":
            setNumber((prev) => decrementNumber(prev));
            setWheelRotation((prev) => prev - 20);
            break;
        }
      }
    }, 120); // Update every 120ms for faster continuous scrolling

    return () => clearInterval(interval);
  }, [
    gameStarted,
    isDragging,
    continuousDirection,
    character,
    number,
    wheelRotation,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d4eb8] via-[#3362fd] to-[#4a70ff] flex flex-col items-center justify-center p-4 space-y-16 relative">
      {/* Custom Retro Cursor */}
      <CustomCursor />

      {/* Screen Flash Effect for Success */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 pointer-events-none screen-flash-animate z-50"></div>
      )}
      {/* Retro Device Housing */}
      <RetroDevice
        onResumeClick={handleResumeClick}
        showResumeApp={showResumeApp}
        onCloseResumeApp={() => setShowResumeApp(false)}
        resumeAppShake={resumeAppShake}
      />

      {/* The Playground Heading */}
      <div className="text-center mb-8">
        <h2 className="font-['Silkscreen:Bold',_Courier,_monospace] text-cyan-400 text-3xl lg:text-4xl tracking-wider drop-shadow-lg">
          THE PLAYGROUND
        </h2>
        <p className="mt-3 font-['Silkscreen:Regular',_Courier,_monospace] text-gray-300 text-sm lg:text-base tracking-wide italic">
          Infinite combos, infinite outcomes
          <br />— every choice rewrites the game.
        </p>
        <div className="mt-2 flex justify-center">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
        </div>
      </div>

      {/* Arcade Button Panel - Below Screen */}
      <div className="w-full max-w-6xl">
        <div className="bg-gradient-to-br from-[#e8e8e8] via-[#d4d4d4] to-[#b8b8b8] rounded-[40px] shadow-2xl p-6">
          {/* Button Panel Inset */}
          <div className="bg-[#1a1a1a] rounded-[30px] shadow-inner p-8 arcade-controls multitouch-enabled">
            {/* Main Button Layout */}
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {/* Left Side - Arcade Joystick */}
              <div className="flex flex-col items-center space-y-4 transform rotate-1 translate-x-10 translate-y-7">
                {/* Joystick Base */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#606060] to-[#404040] rounded-full shadow-[inset_0_-12px_24px_rgba(0,0,0,0.6),inset_0_12px_24px_rgba(255,255,255,0.15),0_8px_16px_rgba(0,0,0,0.4)] select-none relative">
                    {/* Joystick Assembly */}
                    <div
                      className="absolute joystick-area cursor-grab active:cursor-grabbing touch-none"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`,
                        transition: "none",
                      }}
                      onMouseDown={handleJoystickMouseDown}
                      onTouchStart={handleJoystickTouchStart}
                    >
                      {/* Short Black Shaft */}
                      <div className="w-6 h-12 bg-gradient-to-b from-[#333333] via-[#1a1a1a] to-[#000000] rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.1)] relative">
                        {/* Large Joystick Ball */}
                        <div
                          className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-[#ff4444] via-[#ff0000] to-[#aa0000] rounded-full transition-shadow duration-200 ${
                            isDragging
                              ? "shadow-[0_8px_20px_rgba(255,0,0,0.4),0_6px_16px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(255,255,255,0.3),inset_0_-4px_8px_rgba(0,0,0,0.3)]"
                              : "shadow-[0_6px_16px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(255,255,255,0.3),inset_0_-4px_8px_rgba(0,0,0,0.3)]"
                          }`}
                        >
                          {/* Highlight on ball */}
                          <div className="absolute top-3 left-3 w-4 h-4 bg-white/40 rounded-full blur-[2px]"></div>
                          <div className="absolute top-4 left-4 w-2 h-2 bg-white/60 rounded-full"></div>
                          {/* Subtle texture lines */}
                          <div className="absolute inset-2 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"></div>
                          {/* Active drag glow effect */}
                          {isDragging && (
                            <div className="absolute inset-0 rounded-full bg-red-400/20 animate-pulse"></div>
                          )}
                        </div>
                        {/* Shaft collar/mount */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gradient-to-b from-[#666666] to-[#333333] rounded-full shadow-inner"></div>
                      </div>
                    </div>
                    {/* Joystick Ring Indicators */}
                    <div className="absolute inset-3 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] pointer-events-none"></div>
                    <div className="absolute inset-6 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Center - Interactive Character Picker Display */}
              <div
                className="flex-1 flex justify-center items-center"
                style={{ marginLeft: "135px" }}
              >
                <div className="relative">
                  {/* Display Housing - Engraved/Recessed */}
                  <div className="w-52 h-36 bg-gradient-to-br from-[#0a0a0a] via-[#151515] to-[#1a1a1a] rounded-lg shadow-[inset_0_8px_16px_rgba(0,0,0,0.9),inset_0_-4px_8px_rgba(255,255,255,0.05)] border border-[#333333]">
                    {/* Screen Bezel - Flat recessed */}
                    <div className="absolute inset-1 bg-gradient-to-br from-[#0a0a0a] to-[#000000] rounded shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] overflow-hidden">
                      {/* Interactive LCD Screen */}
                      <div
                        className={`absolute inset-1 bg-[#000011] rounded shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] relative lcd-screen`}
                      >
                        {/* Main Display Content Container */}
                        <div
                          className="relative z-10 w-full h-full flex items-center justify-center"
                          style={{
                            transform: "translateY(10px)",
                          }}
                        >
                          {/* Enhanced Character Wheel Around Content */}
                          {gameStarted && (
                            <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                              {/* Character Wheel Container */}
                              <div
                                className={`absolute w-full h-full ${isDragging ? "character-wheel-active" : ""}`}
                                style={{
                                  transform: `rotate(${wheelRotation * 0.3}deg)`, // Faster rotation
                                  transition:
                                    "transform 0.2s ease-out",
                                }}
                              >
                                <svg
                                  width="200"
                                  height="140"
                                  viewBox="0 0 200 140"
                                  className="w-full h-full"
                                >
                                  {/* Outer Letter Ring */}
                                  <g opacity="0.8">
                                    {/* Outer wheel circle */}
                                    <circle
                                      cx="100"
                                      cy="70"
                                      r="55"
                                      fill="none"
                                      stroke="rgba(0,255,0,0.3)"
                                      strokeWidth="1"
                                      strokeDasharray="3,2"
                                    />

                                    {/* Letters A-Z around outer ring */}
                                    {Array.from({
                                      length: 26,
                                    }).map((_, i) => {
                                      const letter =
                                        String.fromCharCode(
                                          65 + i,
                                        );
                                      const angle =
                                        (i * 360) / 26 - 90; // Start from top
                                      const radian =
                                        (angle * Math.PI) / 180;
                                      const x =
                                        100 +
                                        Math.cos(radian) * 50;
                                      const y =
                                        70 +
                                        Math.sin(radian) * 50;

                                      const isSelected =
                                        letter === character;

                                      return (
                                        <g
                                          key={`letter-${letter}`}
                                        >
                                          {/* Letter background circle */}
                                          <circle
                                            cx={x}
                                            cy={y}
                                            r="6"
                                            fill={
                                              isSelected
                                                ? "rgba(0,255,0,0.3)"
                                                : "rgba(0,100,0,0.1)"
                                            }
                                            stroke={
                                              isSelected
                                                ? "rgba(0,255,0,0.8)"
                                                : "rgba(0,255,0,0.2)"
                                            }
                                            strokeWidth="1"
                                          />
                                          {/* Letter text */}
                                          <text
                                            x={x}
                                            y={y + 3}
                                            textAnchor="middle"
                                            fontSize="8"
                                            fill={
                                              isSelected
                                                ? "rgba(0,255,0,1)"
                                                : "rgba(0,255,0,0.6)"
                                            }
                                            fontFamily="'Silkscreen', monospace"
                                            style={{
                                              filter: isSelected
                                                ? "drop-shadow(0 0 3px rgba(0,255,0,0.8))"
                                                : "none",
                                            }}
                                          >
                                            {letter}
                                          </text>

                                          {/* Selection indicator line */}
                                          {isSelected && (
                                            <line
                                              x1="100"
                                              y1="70"
                                              x2={x}
                                              y2={y}
                                              stroke="rgba(0,255,0,0.8)"
                                              strokeWidth="2"
                                              strokeDasharray="3,3"
                                              className="selection-indicator"
                                              style={{
                                                filter:
                                                  "drop-shadow(0 0 2px rgba(0,255,0,0.6))",
                                              }}
                                            />
                                          )}
                                        </g>
                                      );
                                    })}
                                  </g>

                                  {/* Inner Number Ring */}
                                  <g opacity="0.9">
                                    {/* Inner wheel circle */}
                                    <circle
                                      cx="100"
                                      cy="70"
                                      r="30"
                                      fill="none"
                                      stroke="rgba(255,255,0,0.4)"
                                      strokeWidth="1"
                                      strokeDasharray="2,3"
                                    />

                                    {/* Numbers 0-10 around inner ring */}
                                    {Array.from({
                                      length: 11,
                                    }).map((_, i) => {
                                      const num = i;
                                      const angle =
                                        (i * 360) / 11 - 90; // Start from top
                                      const radian =
                                        (angle * Math.PI) / 180;
                                      const x =
                                        100 +
                                        Math.cos(radian) * 25;
                                      const y =
                                        70 +
                                        Math.sin(radian) * 25;

                                      const isSelected =
                                        num === number;

                                      return (
                                        <g
                                          key={`number-${num}`}
                                        >
                                          {/* Number background circle */}
                                          <circle
                                            cx={x}
                                            cy={y}
                                            r="4"
                                            fill={
                                              isSelected
                                                ? "rgba(255,255,0,0.3)"
                                                : "rgba(100,100,0,0.1)"
                                            }
                                            stroke={
                                              isSelected
                                                ? "rgba(255,255,0,0.8)"
                                                : "rgba(255,255,0,0.3)"
                                            }
                                            strokeWidth="1"
                                          />
                                          {/* Number text */}
                                          <text
                                            x={x}
                                            y={y + 2}
                                            textAnchor="middle"
                                            fontSize="6"
                                            fill={
                                              isSelected
                                                ? "rgba(255,255,0,1)"
                                                : "rgba(255,255,0,0.7)"
                                            }
                                            fontFamily="'Silkscreen', monospace"
                                            style={{
                                              filter: isSelected
                                                ? "drop-shadow(0 0 2px rgba(255,255,0,0.8))"
                                                : "none",
                                            }}
                                          >
                                            {num}
                                          </text>

                                          {/* Selection indicator line */}
                                          {isSelected && (
                                            <line
                                              x1="100"
                                              y1="70"
                                              x2={x}
                                              y2={y}
                                              stroke="rgba(255,255,0,0.8)"
                                              strokeWidth="2"
                                              strokeDasharray="2,2"
                                              className="selection-indicator"
                                              style={{
                                                filter:
                                                  "drop-shadow(0 0 2px rgba(255,255,0,0.6))",
                                              }}
                                            />
                                          )}
                                        </g>
                                      );
                                    })}
                                  </g>

                                  {/* Current Selection Highlight Ring */}
                                  <g>
                                    {comboMode ? (
                                      /* Combo mode: highlight both letter and number */
                                      <>
                                        <circle
                                          cx="100"
                                          cy="70"
                                          r="40"
                                          fill="none"
                                          stroke="rgba(255,255,0,0.6)"
                                          strokeWidth="2"
                                          strokeDasharray="4,4"
                                          opacity="0.8"
                                          style={{
                                            animation:
                                              "spin 1.5s linear infinite",
                                          }}
                                        />
                                        <circle
                                          cx="100"
                                          cy="70"
                                          r="20"
                                          fill="none"
                                          stroke="rgba(255,255,0,0.6)"
                                          strokeWidth="2"
                                          strokeDasharray="2,2"
                                          opacity="0.8"
                                          style={{
                                            animation:
                                              "spin 1s linear infinite reverse",
                                          }}
                                        />
                                      </>
                                    ) : (
                                      /* Single selection mode */
                                      <circle
                                        cx="100"
                                        cy="70"
                                        r="42"
                                        fill="none"
                                        stroke="rgba(0,255,0,0.4)"
                                        strokeWidth="1"
                                        strokeDasharray="6,6"
                                        opacity="0.6"
                                        style={{
                                          animation:
                                            "spin 2s linear infinite",
                                        }}
                                      />
                                    )}
                                  </g>

                                  {/* Active input direction indicator */}
                                  {isDragging &&
                                    lastJoystickDirection && (
                                      <g opacity="0.8">
                                        {/* Ring to show active control */}
                                        <circle
                                          cx="100"
                                          cy="70"
                                          r="60"
                                          fill="none"
                                          stroke="rgba(0,255,0,0.6)"
                                          strokeWidth="1"
                                          opacity="0.6"
                                        />
                                      </g>
                                    )}

                                  {/* Directional Indicators */}
                                  <g opacity="0.4">
                                    {/* Top */}
                                    <polygon
                                      points="100,15 105,25 95,25"
                                      fill="rgba(0,255,0,0.3)"
                                      stroke="rgba(0,255,0,0.5)"
                                      strokeWidth="0.5"
                                    />
                                    <text
                                      x="100"
                                      y="13"
                                      textAnchor="middle"
                                      fontSize="3"
                                      fill="rgba(0,255,0,0.8)"
                                      fontFamily="'Silkscreen', monospace"
                                    >
                                      UP
                                    </text>

                                    {/* Right */}
                                    <polygon
                                      points="185,70 175,65 175,75"
                                      fill="rgba(0,255,0,0.3)"
                                      stroke="rgba(0,255,0,0.5)"
                                      strokeWidth="0.5"
                                    />
                                    <text
                                      x="187"
                                      y="72"
                                      textAnchor="start"
                                      fontSize="3"
                                      fill="rgba(0,255,0,0.8)"
                                      fontFamily="'Silkscreen', monospace"
                                    >
                                      RIGHT
                                    </text>

                                    {/* Bottom */}
                                    <polygon
                                      points="100,125 95,115 105,115"
                                      fill="rgba(0,255,0,0.3)"
                                      stroke="rgba(0,255,0,0.5)"
                                      strokeWidth="0.5"
                                    />
                                    <text
                                      x="100"
                                      y="135"
                                      textAnchor="middle"
                                      fontSize="3"
                                      fill="rgba(0,255,0,0.8)"
                                      fontFamily="'Silkscreen', monospace"
                                    >
                                      DOWN
                                    </text>

                                    {/* Left */}
                                    <polygon
                                      points="15,70 25,75 25,65"
                                      fill="rgba(0,255,0,0.3)"
                                      stroke="rgba(0,255,0,0.5)"
                                      strokeWidth="0.5"
                                    />
                                    <text
                                      x="13"
                                      y="72"
                                      textAnchor="end"
                                      fontSize="3"
                                      fill="rgba(0,255,0,0.8)"
                                      fontFamily="'Silkscreen', monospace"
                                    >
                                      LEFT
                                    </text>
                                  </g>
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Central Display Content */}
                          <div className="relative z-20 flex flex-col items-center justify-center">
                            {!gameStarted ? (
                              <div className="text-center flex flex-col items-center justify-center">
                                <div
                                  className="text-white text-sm mb-2 animate-pulse retro-lcd-text"
                                  style={{
                                    fontFamily:
                                      "'Silkscreen:Bold', Courier, monospace",
                                  }}
                                >
                                  PRESS START
                                </div>
                                <div
                                  className="text-white text-sm animate-pulse retro-lcd-text"
                                  style={{
                                    fontFamily:
                                      "'Silkscreen:Bold', Courier, monospace",
                                  }}
                                >
                                  TO PLAY
                                </div>
                              </div>
                            ) : (
                              <div className="text-center flex flex-col items-center justify-center">
                                {/* Main Character/Number Display - Perfect Alignment */}
                                <div
                                  className={`text-white lcd-text-active retro-lcd-text flex items-center justify-center min-h-[60px] min-w-[80px] ${comboMode ? "text-yellow-400" : ""}`}
                                  style={{
                                    fontSize: "4rem",
                                    lineHeight: "1",
                                    fontFamily:
                                      getFontFamily(fontStyle),
                                    textShadow:
                                      "0 0 8px currentColor",
                                    transition:
                                      "all 0.3s ease-out",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "inline-block",
                                      verticalAlign: "middle",
                                      lineHeight: "1",
                                      transform:
                                        "translateY(-2px)", // Fine-tune vertical centering
                                    }}
                                  >
                                    {comboMode
                                      ? `${number}${character}`
                                      : lastJoystickDirection &&
                                          (lastJoystickDirection.includes(
                                            "up",
                                          ) ||
                                            lastJoystickDirection.includes(
                                              "down",
                                            ))
                                        ? number.toString()
                                        : character}
                                  </span>
                                </div>

                                {/* Mode Indicator */}
                                <div
                                  className={`text-xs mb-1 retro-lcd-text ${comboMode ? "text-yellow-400 animate-pulse" : "text-white"}`}
                                  style={{
                                    fontFamily:
                                      "'Silkscreen:Regular', Courier, monospace",
                                  }}
                                >
                                  {comboMode
                                    ? "COMBO MODE"
                                    : "READY"}
                                </div>

                                {/* Font Style Indicator */}
                                <div
                                  className="text-white text-xs opacity-60 retro-lcd-text"
                                  style={{
                                    fontFamily:
                                      "'Silkscreen:Regular', Courier, monospace",
                                  }}
                                >
                                  {fontStyle.toUpperCase()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subtle Scanlines Effect */}

                        {/* Game Status Indicators */}
                        {gameStarted && (
                          <div className="absolute top-2 left-2 right-2 flex justify-between">
                            <div
                              className="text-white text-xs retro-lcd-text"
                              style={{
                                fontFamily:
                                  "'Silkscreen:Regular', Courier, monospace",
                              }}
                            >
                              {character}
                            </div>
                            <div
                              className="text-yellow-400 text-xs retro-lcd-text"
                              style={{
                                fontFamily:
                                  "'Silkscreen:Regular', Courier, monospace",
                              }}
                            >
                              {number}
                            </div>
                          </div>
                        )}

                        {/* Subtle Screen Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#00ff00]/3 rounded pointer-events-none"></div>

                        {/* Active Control Feedback */}
                        {isDragging && gameStarted && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-transparent to-green-400/5 rounded pointer-events-none"></div>
                        )}
                      </div>
                    </div>

                    {/* Corner Screw Holes - Engraved */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-gradient-to-br from-[#000000] to-[#1a1a1a] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] border border-[#333333]"></div>
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-gradient-to-br from-[#000000] to-[#1a1a1a] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] border border-[#333333]"></div>
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-gradient-to-br from-[#000000] to-[#1a1a1a] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] border border-[#333333]"></div>
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-gradient-to-br from-[#000000] to-[#1a1a1a] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] border border-[#333333]"></div>
                  </div>
                </div>
              </div>

              {/* Right Side - 6 Action Buttons */}
              <div className="relative transform -rotate-1">
                {/* Top Row */}
                <div className="flex space-x-5 mb-6 transform translate-x-1">
                  {/* Light Punch */}
                  <button
                    className="group relative touch-manipulation"
                    onClick={() => handleButtonClick("lp")}
                    onMouseDown={() =>
                      handleButtonMouseDown("lp")
                    }
                    onMouseUp={handleButtonMouseUp}
                    onMouseLeave={handleButtonMouseLeave}
                    onTouchStart={(e) =>
                      handleButtonTouchStart("lp", e)
                    }
                    onTouchEnd={(e) =>
                      handleButtonTouchEnd("lp", e)
                    }
                  >
                    <div
                      className={`w-20 h-20 bg-gradient-to-b from-[#ffff00] to-[#cccc00] rounded-full transition-all duration-150 ease-out ${
                        isButtonPressed("lp")
                          ? "shadow-[0_5px_0_#999900,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)] translate-y-4"
                          : "shadow-[0_10px_0_#999900,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      <div className="flex items-center justify-center h-full transform -rotate-2">
                        <span className="font-['Silkscreen:Bold',_Courier,_monospace] text-black text-xl drop-shadow-sm">
                          LP
                        </span>
                      </div>
                      <div className="absolute top-4 left-4 w-3 h-3 bg-white/50 rounded-full"></div>
                    </div>
                  </button>

                  {/* Medium Punch - IBM Plex Mono */}
                  <button
                    className="group relative touch-manipulation"
                    onClick={() => handleButtonClick("mp")}
                    onMouseDown={() =>
                      handleButtonMouseDown("mp")
                    }
                    onMouseUp={handleButtonMouseUp}
                    onMouseLeave={handleButtonMouseLeave}
                    onTouchStart={(e) =>
                      handleButtonTouchStart("mp", e)
                    }
                    onTouchEnd={(e) =>
                      handleButtonTouchEnd("mp", e)
                    }
                  >
                    <div
                      className={`w-20 h-20 bg-gradient-to-b from-[#ff8800] to-[#cc6600] rounded-full transition-all duration-150 ease-out ${
                        isButtonPressed("mp")
                          ? "shadow-[0_5px_0_#994400,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)] translate-y-4"
                          : "shadow-[0_10px_0_#994400,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      <div className="flex items-center justify-center h-full transform rotate-1">
                        <span className="font-['Silkscreen:Bold',_Courier,_monospace] text-white text-lg drop-shadow-sm">
                          IBM
                        </span>
                      </div>
                      <div className="absolute top-4 left-4 w-3 h-3 bg-white/50 rounded-full"></div>
                    </div>
                  </button>

                  {/* Heavy Punch */}
                  <button
                    className="group relative touch-manipulation"
                    onClick={() => handleButtonClick("hp")}
                    onMouseDown={() =>
                      handleButtonMouseDown("hp")
                    }
                    onMouseUp={handleButtonMouseUp}
                    onMouseLeave={handleButtonMouseLeave}
                    onTouchStart={(e) =>
                      handleButtonTouchStart("hp", e)
                    }
                    onTouchEnd={(e) =>
                      handleButtonTouchEnd("hp", e)
                    }
                  >
                    <div
                      className={`w-20 h-20 bg-gradient-to-b from-[#ff0000] to-[#cc0000] rounded-full transition-all duration-150 ease-out ${
                        isButtonPressed("hp")
                          ? "shadow-[0_5px_0_#990000,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)] translate-y-4"
                          : "shadow-[0_10px_0_#990000,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      <div className="flex items-center justify-center h-full transform -rotate-1">
                        <span className="font-['Silkscreen:Bold',_Courier,_monospace] text-white text-xl drop-shadow-sm">
                          HP
                        </span>
                      </div>
                      <div className="absolute top-4 left-4 w-3 h-3 bg-white/50 rounded-full"></div>
                    </div>
                  </button>
                </div>

                {/* Bottom Row */}
                <div className="flex space-x-5 transform translate-x-[82px]">
                  {/* Light Kick - Share Tech Mono */}
                  <button
                    className="group relative touch-manipulation"
                    onClick={() => handleButtonClick("lk")}
                    onMouseDown={() =>
                      handleButtonMouseDown("lk")
                    }
                    onMouseUp={handleButtonMouseUp}
                    onMouseLeave={handleButtonMouseLeave}
                    onTouchStart={(e) =>
                      handleButtonTouchStart("lk", e)
                    }
                    onTouchEnd={(e) =>
                      handleButtonTouchEnd("lk", e)
                    }
                  >
                    <div
                      className={`w-20 h-20 bg-gradient-to-b from-[#888888] to-[#666666] rounded-full transition-all duration-150 ease-out ${
                        isButtonPressed("lk")
                          ? "shadow-[0_5px_0_#444444,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)] translate-y-4"
                          : "shadow-[0_10px_0_#444444,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      <div className="flex items-center justify-center h-full transform -rotate-1">
                        <span className="font-['Silkscreen:Bold',_Courier,_monospace] text-white text-sm drop-shadow-sm">
                          STM
                        </span>
                      </div>
                      <div className="absolute top-4 left-4 w-3 h-3 bg-white/50 rounded-full"></div>
                    </div>
                  </button>

                  {/* Heavy Kick - Purple (Orbitron) */}
                  <button
                    className="group relative touch-manipulation"
                    onClick={() => handleButtonClick("hk")}
                    onMouseDown={() =>
                      handleButtonMouseDown("hk")
                    }
                    onMouseUp={handleButtonMouseUp}
                    onMouseLeave={handleButtonMouseLeave}
                    onTouchStart={(e) =>
                      handleButtonTouchStart("hk", e)
                    }
                    onTouchEnd={(e) =>
                      handleButtonTouchEnd("hk", e)
                    }
                  >
                    <div
                      className={`w-20 h-20 bg-gradient-to-b from-[#8800ff] to-[#6600cc] rounded-full transition-all duration-150 ease-out ${
                        isButtonPressed("hk")
                          ? "shadow-[0_5px_0_#440099,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)] translate-y-4"
                          : "shadow-[0_10px_0_#440099,inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      <div className="flex items-center justify-center h-full transform rotate-1">
                        <span className="font-['Silkscreen:Bold',_Courier,_monospace] text-white text-lg drop-shadow-sm">
                          OR
                        </span>
                      </div>
                      <div className="absolute top-4 left-4 w-3 h-3 bg-white/50 rounded-full"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Start/Select Buttons - Above Info Panel */}
            <div className="mt-8 flex justify-center items-center space-x-6">
              {/* Start Button */}
              <button
                className="group relative touch-manipulation"
                onClick={() => handleButtonClick("start")}
                onMouseDown={() =>
                  handleButtonMouseDown("start")
                }
                onMouseUp={handleButtonMouseUp}
                onMouseLeave={handleButtonMouseLeave}
                onTouchStart={(e) =>
                  handleButtonTouchStart("start", e)
                }
                onTouchEnd={(e) =>
                  handleButtonTouchEnd("start", e)
                }
              >
                <div
                  className={`w-20 h-8 bg-gradient-to-b from-[#ff4444] to-[#cc0000] rounded-lg transition-all duration-150 ease-out ${
                    isButtonPressed("start")
                      ? "shadow-[0_2px_0_#990000,inset_0_1px_0_rgba(255,255,255,0.3)] translate-y-1"
                      : "shadow-[0_4px_0_#990000,inset_0_1px_0_rgba(255,255,255,0.3)]"
                  }`}
                >
                  <div className="font-['Silkscreen:Bold',_Courier,_monospace] text-white text-xs tracking-wide flex items-center justify-center h-full">
                    {gameStarted ? "CLOSE" : "START"}
                  </div>
                </div>
              </button>

              {/* Select Button */}
              <button
                className="group relative touch-manipulation"
                onClick={() => handleButtonClick("select")}
                onMouseDown={() =>
                  handleButtonMouseDown("select")
                }
                onMouseUp={handleButtonMouseUp}
                onMouseLeave={handleButtonMouseLeave}
                onTouchStart={(e) =>
                  handleButtonTouchStart("select", e)
                }
                onTouchEnd={(e) =>
                  handleButtonTouchEnd("select", e)
                }
              >
                <div
                  className={`w-20 h-8 bg-gradient-to-b from-[#4444ff] to-[#2222cc] rounded-lg transition-all duration-150 ease-out ${
                    isButtonPressed("select")
                      ? "shadow-[0_2px_0_#1111aa,inset_0_1px_0_rgba(255,255,255,0.3)] translate-y-1"
                      : "shadow-[0_4px_0_#1111aa,inset_0_1px_0_rgba(255,255,255,0.3)]"
                  }`}
                >
                  <div className="font-['Silkscreen:Bold',_Courier,_monospace] text-white text-xs tracking-wide flex items-center justify-center h-full">
                    SELECT
                  </div>
                </div>
              </button>
            </div>

            {/* Bottom Info Panel */}
            <div className="mt-4 bg-black rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-[#00ff00] text-base tracking-wider">
                  SYSTEM ONLINE:
                </div>

                {/* Centered Clock */}
                <div className="flex-1 flex justify-center">
                  <DigitalStopwatch />
                </div>

                <div className="flex space-x-4">
                  <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-[#ffff00] text-xs">
                    CREDITS: 99
                  </div>
                  <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-[#ff0000] text-xs">
                    HIGH: 999999
                  </div>
                </div>
              </div>

              {/* Control Instructions */}
              <div className="mt-2 pt-2 border-t border-gray-600/30">
                <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-cyan-400 text-xs text-center font-bold no-underline text-[11px]">
                  USE JOYSTICK OR WASD KEYS TO NAVIGATE • SELECT
                  BUTTON FOR UX KNOWLEDGE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Retro Footer */}
      <footer
        className={`w-full mt-16 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border-t-2 transition-all duration-500 ${
          showSuccessAnimation
            ? "border-green-400/60 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            : "border-green-400/30"
        }`}
      >
        <div className="w-full px-4 py-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Contact Form - Left Side */}
            <div className="relative">
              <div className="font-['Silkscreen:Bold',_Courier,_monospace] text-cyan-400 text-sm mb-4 tracking-wider">
                GET IN TOUCH
              </div>

              <form
                className={`space-y-2 relative ${showSuccessAnimation ? "form-success-glow" : ""}`}
                onSubmit={handleSendMessage}
              >
                {/* Success Animation Overlay */}
                {showSuccessAnimation && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                    {/* Particle Burst Effects */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute success-particle"
                        style={
                          {
                            left: "50%",
                            top: "70%",
                            width: "4px",
                            height: "4px",
                            backgroundColor: [
                              "#22d3ee",
                              "#10b981",
                              "#fbbf24",
                              "#f472b6",
                            ][i % 4],
                            borderRadius: "50%",
                            "--particle-x": `${Math.cos((i * 30 * Math.PI) / 180) * 80}px`,
                            "--particle-y": `${Math.sin((i * 30 * Math.PI) / 180) * 80}px`,
                            animationDelay: `${i * 0.1}s`,
                            boxShadow: `0 0 6px currentColor`,
                          } as React.CSSProperties
                        }
                      />
                    ))}

                    {/* Retro Success Indicator */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="success-pulse">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 40 40"
                          className="retro-checkmark-animate"
                        >
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            opacity="0.3"
                          />
                          <path
                            d="M12 20l6 6 12-12"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              filter:
                                "drop-shadow(0 0 4px #10b981)",
                            }}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Retro Sparks */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`spark-${i}`}
                        className="absolute retro-spark-animate"
                        style={
                          {
                            left: "50%",
                            top: "70%",
                            width: "2px",
                            height: "8px",
                            backgroundColor: "#fbbf24",
                            transformOrigin: "center bottom",
                            transform: `translate(-50%, -100%) rotate(${i * 60}deg)`,
                            animationDelay: `${0.3 + i * 0.1}s`,
                            boxShadow: "0 0 4px #fbbf24",
                          } as React.CSSProperties
                        }
                      />
                    ))}

                    {/* Success Text Animation */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8">
                      <div className="celebration-text-animate font-['Silkscreen:Bold',_Courier,_monospace] text-green-400 text-xs tracking-wider">
                        MESSAGE DELIVERED!
                      </div>
                    </div>

                    {/* Retro Terminal Notification */}
                    <div className="absolute -top-8 -right-4 celebration-text-animate">
                      <div className="bg-black/80 border border-green-400/50 rounded px-2 py-1 font-['Courier_New',_monospace] text-green-400 text-xs">
                        &gt; OK
                      </div>
                    </div>
                  </div>
                )}
                {/* Your Name */}
                <div>
                  <label className="font-['Silkscreen:Regular',_Courier,_monospace] text-gray-300 text-xs block mb-0.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-gray-600/50 rounded px-2 py-1 font-['Courier_New',_monospace] text-white text-xs focus:border-cyan-400/70 focus:outline-none transition-colors"
                    placeholder="Enter your name"
                    disabled={
                      messageStatus === "verifying" ||
                      messageStatus === "sending"
                    }
                    required
                  />
                </div>

                {/* Your Email */}
                <div>
                  <label className="font-['Silkscreen:Regular',_Courier,_monospace] text-gray-300 text-xs block mb-0.5">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full bg-black/50 border rounded px-2 py-1 font-['Courier_New',_monospace] text-white text-xs focus:outline-none transition-all duration-300 ${
                      emailInputShake
                        ? "email-input-shake border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        : showEmailError
                          ? "border-red-500/50"
                          : "border-gray-600/50 focus:border-cyan-400/70"
                    }`}
                    placeholder="your.email@example.com"
                    disabled={
                      messageStatus === "verifying" ||
                      messageStatus === "sending"
                    }
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="font-['Silkscreen:Regular',_Courier,_monospace] text-gray-300 text-xs block mb-0.5">
                    Message
                  </label>
                  <textarea
                    rows={2}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-gray-600/50 rounded px-2 py-1 font-['Courier_New',_monospace] text-white text-xs focus:border-cyan-400/70 focus:outline-none transition-colors resize-none"
                    placeholder="Tell me about your project..."
                    disabled={
                      messageStatus === "verifying" ||
                      messageStatus === "sending"
                    }
                    required
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={
                    messageStatus === "verifying" ||
                    messageStatus === "sending"
                  }
                  className={`w-full text-white font-['Silkscreen:Bold',_Courier,_monospace] text-xs py-2 px-3 rounded transition-all duration-300 relative overflow-hidden ${
                    messageStatus === "idle"
                      ? "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer"
                      : messageStatus === "verifying"
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 animate-pulse cursor-not-allowed"
                        : messageStatus === "sending"
                          ? "bg-gradient-to-r from-yellow-600 to-yellow-500 animate-pulse cursor-not-allowed"
                          : messageStatus === "sent"
                            ? "bg-gradient-to-r from-green-600 to-green-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-red-600 to-red-500 cursor-not-allowed"
                  }`}
                >
                  {/* Button Text */}
                  <span
                    className={`transition-all duration-300 ${
                      messageStatus === "verifying" ||
                      messageStatus === "sending"
                        ? "animate-pulse"
                        : messageStatus === "sent"
                          ? "celebration-text-animate"
                          : ""
                    }`}
                  >
                    {messageStatus === "idle" && "SEND MESSAGE"}
                    {messageStatus === "verifying" &&
                      "VALIDATING EMAIL..."}
                    {messageStatus === "sending" &&
                      "SENDING..."}
                    {messageStatus === "sent" &&
                      "MESSAGE SENT ✓"}
                    {messageStatus === "error" &&
                      "FAILED - TRY AGAIN"}
                  </span>

                  {/* Retro Loading Animation */}
                  {(messageStatus === "verifying" ||
                    messageStatus === "sending") && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex space-x-1">
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Success Effects */}
                  {messageStatus === "sent" && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-green-300/30 animate-pulse"></div>

                      {/* Success Button Particles */}
                      <div className="absolute inset-0">
                        {Array.from({ length: 8 }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className="absolute success-particle"
                              style={
                                {
                                  left: "50%",
                                  top: "50%",
                                  width: "2px",
                                  height: "2px",
                                  backgroundColor: "#10b981",
                                  borderRadius: "50%",
                                  "--particle-x": `${Math.cos((i * 45 * Math.PI) / 180) * 30}px`,
                                  "--particle-y": `${Math.sin((i * 45 * Math.PI) / 180) * 30}px`,
                                  animationDelay: `${i * 0.05}s`,
                                  boxShadow: "0 0 3px #10b981",
                                } as React.CSSProperties
                              }
                            />
                          ),
                        )}
                      </div>

                      {/* Button Success Glow */}
                      <div
                        className="absolute inset-0 rounded animate-pulse"
                        style={{
                          boxShadow:
                            "inset 0 0 20px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.3)",
                        }}
                      ></div>
                    </>
                  )}

                  {/* Error Effect */}
                  {messageStatus === "error" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-300/20 animate-pulse"></div>
                  )}
                </button>
              </form>

              {/* Email Validation Error Notification */}
              {showEmailError && emailValidationError && (
                <div className="mt-4 relative">
                  <div className="email-error-slide-in bg-gradient-to-r from-red-900/90 to-red-800/90 border-2 border-red-500/60 rounded-lg p-4 backdrop-blur-sm">
                    {/* Error Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center error-pulse">
                          <span className="font-['Silkscreen:Bold',_Courier,_monospace] text-white text-xs">
                            !
                          </span>
                        </div>
                        <span className="font-['Silkscreen:Bold',_Courier,_monospace] text-red-300 text-sm tracking-wider">
                          EMAIL VALIDATION ERROR
                        </span>
                      </div>

                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDismissErrorClick();
                        }}
                        className="w-6 h-6 bg-red-700/50 hover:bg-red-600/70 active:bg-red-800/70 active:scale-90 rounded border border-red-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                      >
                        <span className="font-['Silkscreen:Bold',_Courier,_monospace] text-red-300 text-xs">
                          ×
                        </span>
                      </button>
                    </div>

                    {/* Error Message */}
                    <div className="font-['Courier_New',_monospace] text-red-200 text-sm leading-relaxed mb-3 retro-text-flicker">
                      {emailValidationError}
                    </div>

                    {/* Retro Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFixEmailClick();
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 active:from-cyan-700 active:to-cyan-600 active:scale-95 text-white font-['Silkscreen:Bold',_Courier,_monospace] text-xs rounded border border-cyan-400/30 transition-all duration-200 hover:shadow-[0_0_10px_rgba(34,211,238,0.4)] retro-button-glow"
                      >
                        FIX EMAIL
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowEmailError(false);
                          setEmailValidationError(null);
                          setEmailInputShake(false);
                          setMessageStatus("idle");
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 active:from-gray-700 active:to-gray-600 active:scale-95 text-white font-['Silkscreen:Bold',_Courier,_monospace] text-xs rounded border border-gray-400/30 transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDismissErrorClick();
                        }}
                      >
                        DISMISS
                      </button>
                    </div>

                    {/* Retro Error Pattern Overlay */}
                    <div
                      className="absolute inset-0 opacity-10 rounded-lg"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,0,0,0.1) 4px, rgba(255,0,0,0.1) 8px)",
                      }}
                    ></div>

                    {/* Error Border Glow Animation */}
                    <div className="absolute inset-0 rounded-lg pointer-events-none error-border-glow"></div>

                    {/* Scanning Line Effect */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent error-scan-line"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Brand & Tech Stack - Right Side */}
            <div className="text-center md:text-right">
              <div className="font-['Silkscreen:Bold',_Courier,_monospace] text-green-400 text-xl mb-2 tracking-wider">
                SHUBHAM.EXE
              </div>
              <a
                href="mailto:shubhamsharma.ux@gmail.com"
                className="font-['Silkscreen:Regular',_Courier,_monospace] text-cyan-400 text-xs mb-3 tracking-wider underline hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-300 cursor-pointer block"
              >
                shubhamsharma.ux@gmail.com
              </a>
              <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-gray-300 text-sm mb-4">
                Digital Portfolio v2.0
              </div>

              {/* Tech Stack */}
              <div className="font-['Silkscreen:Bold',_Courier,_monospace] text-purple-400 text-sm mb-3 tracking-wider">
                TECH STACK
              </div>
              <div className="space-y-1">
                {[
                  "FIGMA",
                  "UX DESIGNING",
                  "PROTOTYPING",
                  "BRANDING",
                ].map((tech) => (
                  <div key={tech} className="block">
                    <span className="font-['Silkscreen:Regular',_Courier,_monospace] text-gray-300 text-xs">
                      {tech}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status Dots */}
              <div className="flex justify-center md:justify-end mt-4 space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
            <div className="absolute inset-0 flex justify-center">
              <div className="bg-[#1a1a2e] px-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-gray-400 text-xs">
              © 2024 SHUBHAM PORTFOLIO. ALL RIGHTS RESERVED.
            </div>

            {/* Status */}
            <div
              className="flex items-center space-x-3"
              style={{ marginLeft: "-120px" }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-['Silkscreen:Regular',_Courier,_monospace] text-green-400 text-xs">
                  ONLINE
                </span>
              </div>
              <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-gray-400 text-xs">
                |
              </div>
              <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-gray-400 text-xs">
                BUILD: {new Date().getFullYear()}.
                {String(new Date().getMonth() + 1).padStart(
                  2,
                  "0",
                )}
                .{String(new Date().getDate()).padStart(2, "0")}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                {
                  name: "LINKEDIN",
                  color: "text-blue-400",
                  href: "https://www.linkedin.com/in/shubham-sharma-78b134292/",
                },
                {
                  name: "INSTAGRAM",
                  color: "text-pink-400",
                  href: "https://www.instagram.com/born_clever?igsh=ajNsdWlsOXdqbG43",
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target={
                    social.href !== "#" ? "_blank" : undefined
                  }
                  rel={
                    social.href !== "#"
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={`font-['Silkscreen:Regular',_Courier,_monospace] ${social.color} text-xs hover:text-green-400 transition-colors duration-200 hover:shadow-[0_0_5px_rgba(34,197,94,0.5)] px-2 py-1 border border-gray-600/30 rounded hover:border-green-400/50`}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Terminal-style bottom bar */}
          <div className="mt-6 bg-black/50 rounded border border-green-400/20 p-2">
            <div className="font-['Courier_New',_monospace] text-green-400 text-xs">
              <span className="text-yellow-400">
                shubham@portfolio:~$
              </span>{" "}
              echo &quot;Thanks for visiting my digital
              space!&quot;
            </div>
          </div>
        </div>
      </footer>

      {/* UX Knowledge Dialog */}
      <Dialog
        open={showUXDialog}
        onOpenChange={setShowUXDialog}
      >
        <DialogContent className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border-2 border-cyan-400/60 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="font-['Silkscreen:Bold',_Courier,_monospace] text-cyan-400 text-2xl mb-2 tracking-wider">
              UX KNOWLEDGE
            </DialogTitle>
            <DialogDescription className="font-['Silkscreen:Regular',_Courier,_monospace] text-gray-300 text-sm">
              Selected Character:{" "}
              <span className="text-yellow-400 font-bold">
                {character}
              </span>{" "}
              | Number:{" "}
              <span className="text-yellow-400 font-bold">
                {number}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Dynamic UX Quote based on character combination */}
            {(() => {
              const content = getUXContent(character, number);
              return (
                <div
                  className={`bg-gradient-to-r ${content.color} rounded-lg p-4 border ${content.borderColor}`}
                >
                  <blockquote
                    className={`font-['Silkscreen:Regular',_Courier,_monospace] ${content.textColor} text-sm italic text-center`}
                  >
                    "{content.quote}"
                  </blockquote>
                  <cite
                    className={`block text-center mt-2 font-['Silkscreen:Bold',_Courier,_monospace] ${content.authorColor} text-xs`}
                  >
                    - {content.author}
                  </cite>
                </div>
              );
            })()}

            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowUXDialog(false)}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-['Silkscreen:Bold',_Courier,_monospace] text-sm py-2 px-6 rounded transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}