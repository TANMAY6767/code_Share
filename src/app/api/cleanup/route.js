import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import { ProjectNode } from '@/models/ProjectNode';

export async function GET() {
  await dbConnect();

  const now = new Date();
  const expiredProjects = await Project.find({ expiresAt: { $lt: now } });

  for (const project of expiredProjects) {
    const deletedNodes = await ProjectNode.deleteMany({ projectId: project._id });
    const deletedProject = await Project.deleteOne({ _id: project._id });

    console.log(`🗑 Deleted project ${project.slug} and its ${deletedNodes.deletedCount} nodes.`);
  }

  // ✅ Extra step: clean orphaned nodes
  const allProjects = await Project.find({}, { _id: 1 });
  const validProjectIds = allProjects.map(p => p._id);

  const orphanedNodes = await ProjectNode.deleteMany({
    projectId: { $nin: validProjectIds },
  });

  if (orphanedNodes.deletedCount > 0) {
    console.log(`🧹 Cleaned up ${orphanedNodes.deletedCount} orphaned nodes.`);
  }

  return NextResponse.json({
    message: 'Cleanup completed',
    deletedProjects: expiredProjects.length,
    orphanedNodesDeleted: orphanedNodes.deletedCount,
  });
}
