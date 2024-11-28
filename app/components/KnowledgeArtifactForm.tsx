import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/markdown-editor";
import { snakeCase } from "lodash";

export type KnowledgeArtifact = {
  id: string;
  data: string;
  tags: string[];
  title: string;
  createdAt?: string;
};

type KnowledgeArtifactFormProps = {
  initialArtifact?: KnowledgeArtifact;
  onSubmit: (artifact: KnowledgeArtifact) => void;
  onCancel: () => void;
  submitButtonText: string;
  editing: boolean;
};

export function KnowledgeArtifactForm({
  initialArtifact,
  onSubmit,
  onCancel,
  submitButtonText,
  editing,
}: KnowledgeArtifactFormProps) {
  const [artifact, setArtifact] = useState<KnowledgeArtifact>(
    initialArtifact || {
      id: "",
      data: "",
      tags: [],
      title: "",
    },
  );
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = artifact.data.trim().split(/\s+/).length;
    setWordCount(words);
  }, [artifact.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sanitized = {
      ...artifact,
      tags: artifact.tags.map((tag) => snakeCase(tag).toLowerCase().trim()),
    };

    setArtifact(sanitized);

    onSubmit(sanitized);
  };

  return (
    <Card className="w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h3 className="text-lg font-semibold">Knowledge Artifact</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={artifact.id}
              onChange={(e) => {
                if (!editing) {
                  setArtifact({ ...artifact, id: e.target.value });
                }
              }}
              placeholder="Enter ID"
              className="text-sm"
              required={!editing}
              disabled={editing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={artifact.title}
              onChange={(e) =>
                setArtifact({ ...artifact, title: e.target.value })
              }
              placeholder="Enter title"
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <MarkdownEditor
              markdown={artifact.data}
              onChange={(markdown) =>
                setArtifact({ ...artifact, data: markdown })
              }
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              {wordCount} {wordCount === 1 ? "word" : "words"}
              {wordCount > 300 && (
                <span className="ml-2 text-red-500">
                  Warning: Exceeds 300 words
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated, lowercase)</Label>
            <Input
              id="tags"
              value={artifact.tags?.join(", ")}
              onChange={(e) =>
                setArtifact({
                  ...artifact,
                  tags: e.target.value.split(",").map((tag) => tag.trim()),
                })
              }
              placeholder="Add tags, separated by commas"
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Tags allow the agents to narrow down the search for relevant
              knowledge. Best practice is to use a single tag per artifact.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{submitButtonText}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
