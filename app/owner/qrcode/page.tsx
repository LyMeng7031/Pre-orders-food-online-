"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Download, Copy, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

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

  const downloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.png";
    link.click();
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

              <div className="flex flex-col items-center mb-6">
                {/* QR Image */}
                <div className="p-4 bg-gray-100 rounded-lg shadow-lg">
                  <QRCodeCanvas
                    value={shareableLink}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadQR}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download QR
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
                <p className="text-sm">
                  💡 <strong>Tip:</strong> You can also share this QR code
                  digitally or print it for your restaurant.
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
                  className="flex-1 px-4 py-2 border text-gray-700 border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 " />
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
          </div>
        </div>
      </div>
    </div>
  );
}
