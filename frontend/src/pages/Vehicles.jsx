import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { vehiclesAPI } from '../api/endpoints'
import { Car, Plus, Trash2, Fuel, Wrench } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import { useForm } from 'react-hook-form'
import { differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'

function VehicleCard({ vehicle, onDelete }) {
  const insuranceDays = vehicle.insurance?.expiryDate ? differenceInDays(new Date(vehicle.insurance.expiryDate), new Date()) : null
  const pucDays = vehicle.puc?.expiryDate ? differenceInDays(new Date(vehicle.puc.expiryDate), new Date()) : null
  const statusColor = (days) => days === null ? 'var(--text-muted)' : days < 0 ? '#f43f5e' : days <= 14 ? '#f59e0b' : '#10b981'

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass card-hover"
      style={{ padding: '1.125rem', borderRadius: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            {vehicle.type === 'bike' ? '🏍️' : vehicle.type === 'truck' ? '🚛' : '🚗'}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{vehicle.make} {vehicle.model}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{vehicle.registrationNumber} · {vehicle.year}</div>
          </div>
        </div>
        <button onClick={() => onDelete(vehicle._id)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#f43f5e', cursor: 'pointer' }}>
          <Trash2 size={12} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {[{ label: 'INSURANCE', days: insuranceDays }, { label: 'PUC', days: pucDays }].map(({ label, days }) => (
          <div key={label} style={{ padding: '0.5rem 0.75rem', borderRadius: '7px', background: `${statusColor(days)}10`, border: `1px solid ${statusColor(days)}22` }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: statusColor(days) }}>
              {days === null ? 'Not set' : days < 0 ? 'Expired' : `${days}d left`}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Fuel size={12} /> {vehicle.fuelLogs?.length || 0} fuel logs</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wrench size={12} /> {vehicle.serviceHistory?.length || 0} services</span>
      </div>
    </motion.div>
  )
}

export default function Vehicles() {
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesAPI.getAll().then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => vehiclesAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['vehicles']); toast.success('Vehicle deleted') },
  })

  const onSubmit = async (form) => {
    try {
      await vehiclesAPI.create({
        type: form.type, make: form.make, model: form.model, year: form.year,
        registrationNumber: form.registrationNumber, color: form.color,
        insurance: { provider: form.insuranceProvider, policyNumber: form.insurancePolicy, expiryDate: form.insuranceExpiry },
        puc: { certificateNumber: form.pucCert, expiryDate: form.pucExpiry },
      })
      qc.invalidateQueries(['vehicles'])
      toast.success('Vehicle added!')
      reset(); setIsOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const sec = (t) => <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', paddingTop: '0.25rem' }}>{t}</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Car size={22} color="#0ea5e9" /> Vehicle Manager</h1>
          <p className="page-subtitle">Track insurance, PUC, service history and fuel logs</p>
        </div>
        <button className="btn-primary" onClick={() => setIsOpen(true)}><Plus size={16} /> Add Vehicle</button>
      </div>

      {isLoading ? <SkeletonGrid count={3} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '0.875rem' }}>
          {vehicles.map(v => <VehicleCard key={v._id} vehicle={v} onDelete={id => deleteMutation.mutate(id)} />)}
          {!vehicles.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon"><Car size={26} color="#0ea5e9" /></div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No vehicles added</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add your car or bike to track insurance and PUC</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); reset() }} title="Add Vehicle" size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {sec('Vehicle Details')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div><label className="form-label">Type</label><select {...register('type')} className="input-dark">{['car','bike','truck','other'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="form-label">Make *</label><input {...register('make',{required:true})} placeholder="Toyota" className="input-dark" /></div>
              <div><label className="form-label">Model *</label><input {...register('model',{required:true})} placeholder="Fortuner" className="input-dark" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div><label className="form-label">Year</label><input {...register('year',{valueAsNumber:true})} type="number" placeholder="2022" className="input-dark" /></div>
              <div><label className="form-label">Reg. Number</label><input {...register('registrationNumber')} placeholder="MH 01 AB 1234" className="input-dark" /></div>
              <div><label className="form-label">Color</label><input {...register('color')} placeholder="White" className="input-dark" /></div>
            </div>
            {sec('Insurance')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div><label className="form-label">Provider</label><input {...register('insuranceProvider')} placeholder="HDFC ERGO" className="input-dark" /></div>
              <div><label className="form-label">Policy Number</label><input {...register('insurancePolicy')} placeholder="POL-123456" className="input-dark" /></div>
              <div><label className="form-label">Expiry Date</label><input {...register('insuranceExpiry')} type="date" className="input-dark" /></div>
            </div>
            {sec('PUC Certificate')}
            <div className="form-row">
              <div><label className="form-label">Certificate Number</label><input {...register('pucCert')} placeholder="PUC-XXXXXX" className="input-dark" /></div>
              <div><label className="form-label">Expiry Date</label><input {...register('pucExpiry')} type="date" className="input-dark" /></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setIsOpen(false); reset() }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Add Vehicle'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
