import { useEffect, useState } from "react";
import { Upload, X, MoveLeft, MoveRight } from "lucide-react";
import client from "../api/client";

interface CloudinaryUploadProps {
	value?: string[];
	onChange: (urls: string[]) => void;
	maxFiles?: number;
}

export default function CloudinaryUpload({ value = [], onChange, maxFiles = 12 }: CloudinaryUploadProps) {
	const [images, setImages] = useState<string[]>(value);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	useEffect(() => {
		setImages(value || []);
	}, [value]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const remaining = maxFiles - images.length;
		if (remaining <= 0) {
			alert(`Maximum ${maxFiles} images allowed`);
			return;
		}

		const filesToUpload = Array.from(files).slice(0, remaining);
		setUploading(true);
		setUploadProgress(0);

		try {
			const uploaded: string[] = [];

			for (let i = 0; i < filesToUpload.length; i++) {
				const fd = new FormData();
				fd.append("file", filesToUpload[i]);
				fd.append("folder", "models");

				const res = await client.post("/api/uploads", fd, {
					headers: { "Content-Type": "multipart/form-data" },
				});

				uploaded.push(res.data.url);
				setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
			}

			const next = [...images, ...uploaded];
			setImages(next);
			onChange(next);
		} catch (err) {
			console.error("Upload error", err);
			alert("Failed to upload images. Check console for details.");
		} finally {
			setUploading(false);
			setUploadProgress(0);
			e.target.value = "";
		}
	};

	const removeImage = (index: number) => {
		const next = images.filter((_, i) => i !== index);
		setImages(next);
		onChange(next);
	};

	const moveImage = (from: number, to: number) => {
		if (to < 0 || to >= images.length) return;
		const next = [...images];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		setImages(next);
		onChange(next);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium text-gray-700">Car Images ({images.length}/{maxFiles})</div>
				<div className="relative">
					<input
						type="file"
						accept="image/*"
						multiple
						className="absolute inset-0 opacity-0 cursor-pointer"
						onChange={handleFileChange}
						disabled={uploading}
					/>
					<button
						type="button"
						className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
						disabled={uploading}
					>
						<Upload className="w-4 h-4 mr-2" />
						{uploading ? `Uploading ${uploadProgress}%` : "Upload Images"}
					</button>
				</div>
			</div>

			{uploading && (
				<div className="w-full bg-gray-200 rounded-full h-2.5">
					<div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
				</div>
			)}

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
				{images.map((img, idx) => (
					<div key={idx} className="relative group border rounded-lg overflow-hidden">
						<img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover" />
						<div className="absolute inset-0 flex items-start justify-between p-1 opacity-0 group-hover:opacity-100 transition">
							<div className="flex space-x-1">
								<button type="button" className="p-1 bg-white/90 rounded" onClick={() => moveImage(idx, idx - 1)} disabled={idx === 0}>
									<MoveLeft className="w-4 h-4" />
								</button>
								<button type="button" className="p-1 bg-white/90 rounded" onClick={() => moveImage(idx, idx + 1)} disabled={idx === images.length - 1}>
									<MoveRight className="w-4 h-4" />
								</button>
							</div>
							<button type="button" className="p-1 bg-white/90 rounded" onClick={() => removeImage(idx)}>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
