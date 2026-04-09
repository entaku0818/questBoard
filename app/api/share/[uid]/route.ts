import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(_req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params
    const snap = await getAdminDb().collection('users').doc(uid).get()
    if (!snap.exists) {
      return Response.json({ error: 'not found' }, { status: 404 })
    }
    const data = snap.data() ?? {}
    return Response.json({
      bucketList: data.bucketList ?? [],
      updatedAt: data.updatedAt ?? null,
    })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
