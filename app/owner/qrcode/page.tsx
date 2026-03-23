"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Download, Copy, Check } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function QRCodePage() {
  const [user, setUser] = useState<User | null>(null);
  const [shareableLink, setShareableLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "OWNER") {
      router.push("/customer");
      return;
    }

    setUser(parsedUser);
    generateShareableLink(parsedUser._id);
  }, [router]);

  const generateShareableLink = (ownerId: string) => {
    // Generate the shareable link
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${baseUrl}/owner/${ownerId}`;
    setShareableLink(link);
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name}'s Menu`,
          text: `Check out ${user?.name}'s menu and order delicious food!`,
          url: shareableLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyToClipboard();
    }
  };

  const generateQRCodeText = () => {
    // Simple QR code representation using text
    return `
╔══════════════════════════════╗
║                                ║
║     SCAN TO VIEW MENU          ║
║                                ║
║  ${shareableLink.slice(0, 25)}  ║
║  ${shareableLink.slice(25, 50)}  ║
║  ${shareableLink.slice(50, 75) || ""}  ║
║                                ║
║     ${user?.name || "Menu"}           ║
║                                ║
╚══════════════════════════════╝
    `.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating shareable link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                QR Code & Share
              </h1>
              <p className="text-gray-600">Share your menu with customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* QR Code Section */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your Menu QR Code
              </h2>
              <p className="text-gray-600 mb-6">
                Customers can scan this QR code to directly access your menu and
                place orders.
              </p>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-100 rounded-lg shadow-lg inline-block">
                  <div className="bg-white p-4 rounded">
                    <div className="text-xs font-mono text-center">
                      {generateQRCodeText()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
                <p className="text-sm">
                  💡 <strong>Tip:</strong> Use an online QR code generator with
                  your shareable link to create a printable QR code for your
                  restaurant.
                </p>
              </div>
            </div>

            {/* Share Link Section */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Shareable Link
              </h3>
              <p className="text-gray-600 mb-4">
                Share this link on social media, websites, or with customers
                directly.
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={shareLink}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Link
              </button>
            </div>

            {/* Instructions */}
            <div className="border-t pt-8 mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                How to Use
              </h3>
              <div className="space-y-4 text-gray-600">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </div>
                  <p>
                    Copy your shareable link and use any online QR code
                    generator to create a printable QR code.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </div>
                  <p>
                    Share the link directly on social media, your website, or in
                    messages with customers.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </div>
                  <p>
                    Customers click the link or scan your QR code to view your
                    menu and place orders directly.
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Generator Suggestion */}
            <div className="border-t pt-8 mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Recommended QR Code Generators
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="https://qr-code-generator.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900">
                    QR Code Generator
                  </h4>
                  <p className="text-sm text-gray-600">
                    Free online QR code generator
                  </p>
                </a>
                <a
                  href="https://www.the-qr-code-generator.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900">
                    The QR Code Generator
                  </h4>
                  <p className="text-sm text-gray-600">
                    Customizable QR codes with logos
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
