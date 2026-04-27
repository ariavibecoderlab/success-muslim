import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { getIncomeCategory } from '@/lib/wealth-categories';

interface Props {
  category: string;
  onClose: () => void;
}

/**
 * Compact inline form for logging an income transaction without leaving
 * the Income Sources card. Auto-focuses the amount field and commits via Enter.
 */
export default function InlineIncomeQuickAdd({ category, onClose }: Props) {
  const cat = getIncomeCategory(category);
  const Icon = cat.icon;
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const canSave = !!amount && parseFloat(amount) > 0;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await api('api-wealth', {
        method: 'POST',
        params: { resource: 'transactions' },
        body: {
          type: 'income',
          amount: parseFloat(amount),
          category,
          description: note || null,
          date,
          is_recurring: false,
          recurrence_interval: null,
        },
      });
      toast.success(`${cat.label} income logged`);
      // Refresh dependent queries.
      queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      queryClient.invalidateQueries({ queryKey: ['wealth-summary'] });
      onClose();
    } catch {
      toast.error('Failed to log income');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="rounded-xl border border-border bg-muted/30 p-3 space-y-2"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${cat.color}1f` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
        </div>
        <span className="text-xs font-medium flex-1">Add to {cat.label}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex gap-2">
        <Input
          ref={amountRef}
          type="number"
          inputMode="decimal"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="h-9 text-sm flex-1"
        />
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="h-9 text-sm w-[140px]"
        />
      </div>

      <Input
        placeholder="Note (optional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="h-9 text-sm"
      />

      <Button
        onClick={handleSave}
        disabled={!canSave || saving}
        size="sm"
        className="w-full h-9 gap-1.5"
      >
        <Check className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );
}
